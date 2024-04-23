---
title: "Optimizing Flutter - Part 2: Build Runner"
date: "2024-04-23T16:51:00.000Z"
template: "post"
draft: false
slug: "/posts/optimizing-flutter-buildrunner/"
category: "Flutter"
tags:
  - "Flutter"
  - "Android"
  - "Ios"
description: "Let's take a look at build runner for codegen and how we could speed it up."
socialImage: "./banner.png"
---

![Banner graphic Flutter codegen optimization](banner.png)

In the [last article](/posts/optimizing-flutter-tests/), we explored techniques to speed up Flutter test execution. Now, let's take a look at another area for optimization in the Flutter environment i.e. [build runner](https://pub.dev/packages/build_runner).

## Motivation

I've been using generators to get rid of boiler plate code for some time now. Be it json decoding, immutable classes using [Freezed](https://pub.dev/packages/freezed/) or mock objects in my tests. The trouble is the build runner takes a lot of time to run, sometimes disproportionate to the changes made. I've tried using the `watch` feature of the runner but it crashes a lot of the time rendering it less useful.

Let's see if there's another way to alleviate these problems by exploring the build runner.

## Partial Builds

When looking at the build runner's [documentation](https://github.com/dart-lang/build/blob/master/docs/partial_builds.md), I came across a parameter called `build-filter` which is documented as follows

> Whenever a build filter is provided, only required outputs matching one of the build filters will be built, in addition to any required files for those outputs.

While we may not be able to speed up a fresh codegen cycle, we could leverage this parameter to speed up incremental builds to ensure we only run the build runner on the diff. So let's set up the script.

## Calculating Changed Files

We start by figuring out which files have changed. Linux, offers a nice solution to figure out the files changed since a particular time

```shell
find . -type f -mmin 2
```

This would give us the actual files that were updated in the current directory since the last 2 minutes.

In order to use this, we need to store an epoch timestamp to know when we'd last run the incremental build. So let's create a temporary file `build.timestamp` that gets updated with the current timestamp everytime we invoke our build script. Let's add it to our script.

```shell
if [ -f  build.timestamp ]; then
    echo "Running incremental build"
    log_time=$(cat build.timestamp | sed 's/^[   ]*//;s/[    ]*$//')
else
    echo "Running build first time"
    dart run build_runner build
fi

date +"%s" > build.timestamp
```

So, all this script does is checks for existence of a file called `build.timestamp` and reads the value of epoch timestamp into `log_time`. If it doesn't find the file ,we've run the build runner on the entire project. Lastly, we emit the updated timestamp into the file.

Next, we need to calculate the delta in minutes and pipe it into our `find` command as shown below

```shell
current_epoch=$(date +%s)
difference_seconds=$((current_epoch - log_time))
diff_mins=$(echo "scale=2; $difference_seconds / 60" | bc)
diff_mins_rounded_up=$(echo "$diff_mins + 0.9999" | bc | awk '{printf "%.0f\n", $1}')

changed_files=$(find . -type f -mmin "-$diff_mins_rounded_up")
```

> ⓘ Note: We've ceiled up the difference in order to avoid missing any changed files.

## Filtering Noise

Now that we have a list of all files that changed we would only want to retain files belonging to the "lib" and "test" folders. So let's update the `changed_files` field

```shell
changed_files=$(find . -type f -mmin "-$diff_mins_rounded_up" | grep -E "^\.\/(lib\/|test\/)")
```

Next, we would want to map the file paths with wildcard `*` so that we use both the source file and the generated files(eg. **_file.g.dart, file.freezed.dart_** etc) as inputs to the build runner i.e. convert`lib/main.dart` to `lib/main*.dart`. We can do this using `sed` as follows

```shell
changed_files=$(find . -type f -mmin "-$diff_mins_rounded_up" | grep -E "^\.\/(lib\/|test\/)" | sed 's/\.dart$/*\.dart/')

```

## Finishing up

Finally, we need to map these file paths into the `build_filter` parameter and generate the final command that needs to be executed which would look something like below

```shell
dart run build_runner build \
  --build-filter="lib/main.dart" \
  --build-filter="test/main_bloc_test.dart"
```

We can do that by using `sed` in the manner shown below

```shell
changed_files=$(find . -type f -mmin "-$diff_mins_rounded_up" | grep -E "^\.\/(lib\/|test\/)" | sed 's/\.dart$/*\.dart/' | sed "s/^/ --build-filter=\"/ ; s/$/\"/")
command="dart run build_runner build $changed_files"
eval "$command"
```

I've left out some formatting commands for simplicity, However, you may find the full script below

```shell
# incremental_build.sh
set -e
if [ -f  build.timestamp ]; then
    echo "Running incremental build"
    log_time=$(cat build.timestamp | sed 's/^[   ]*//;s/[    ]*$//')
    human_readable_time=$(date -r $log_time)
    echo "Last build time: $human_readable_time"
    current_epoch=$(date +%s)
    difference_seconds=$((current_epoch - log_time))
    diff_mins=$(echo "scale=2; $difference_seconds / 60" | bc)
    diff_mins_rounded_up=$(echo "$diff_mins + 0.9999" | bc | awk '{printf "%.0f\n", $1}')
    changed_files=$(find . -type f -mmin "-$diff_mins_rounded_up" | grep -E "^\.\/(lib\/|test\/)" | sed "s/^\.\///" | sed 's/\.dart$/*\.dart/' | sed -E '/^$/d' | sed "s/^/ --build-filter=\"/ ; s/$/\"/")
    count=$(wc -l <<< "$changed_files")
    echo "Changed files: $count"
    changed_files="${changed_files//$'\n'/}"
    command="dart run build_runner build $changed_files"
    eval "$command"
else
    echo "Running build first time"
    dart run build_runner build
fi

date +"%s" > build.timestamp
```

## Measuring Gains

Now that we have our script, let's see the performance gains. I've updated two dart files and ran

```shell
time dart run build_runner build

[INFO] Succeeded after 1m 30s with 66 outputs (900 actions)

dart run build_runner build  111.00s user 4.93s system 120% cpu 1:35.87 total
```

Now let's see how long it our new script fares

```shell
time ./incremental_build.sh
Running incremental build
Last build time: Tue Apr 23 10:26:53 IST 2024

[INFO] Succeeded after 35.5s with 66 outputs (79 actions)

./incremental_build.sh  49.17s user 3.69s system 127% cpu 41.344 total
```

We've reduced the build time by less than half of what it was earlier 😱.

Hope you've found this useful. Happy scripting folks.
