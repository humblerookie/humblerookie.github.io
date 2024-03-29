---
title: Optimizing Performance of your Flutter tests
date: "2024-03-29T16:51:00.000Z"
template: "post"
draft: false
slug: "/posts/optimizing-flutter-tests/"
category: "Flutter"
tags:
  - "Flutter"
  - "Android"
  - "Ios"
description: "We look how to speedup our tests in flutter and leveraging some options to improve readability on our CI."
socialImage: "./banner.jpg"
---

![Banner graphic Kotlin](banner.jpg)


Recently, while looking around avenues for optimisation on our CI pipeline, I was exploring the tests library and ran into an interesting parameter.

#### Concurrency

```bash
flutter test --concurrency=<default>
```

Test suites by default run on half of the number of CPU cores. We can leverage this parameter to control the number of test suites that run in parallel. 

First let's try and see how the tests perform on a project with  430 tests.

```shell
/usr/bin/time -l flutter test
```

> ⓘ Note: We've used the full qualifier **"/usr/bin/time"** instead of **"time"** since it allows us to pass the more arguments.


```shell
🎉 430 tests passed.
       29.03 real        41.32 user         9.33 sys
          1551482880  maximum resident set size
           226740352  peak memory footprint

```

Now let's try with the max cores on our machine allows i.e. **10**
```shell
/usr/bin/time -l flutter test --reporter=github --concurrency=10
```

```shell
🎉 430 tests passed.
       22.23 real        42.51 user        10.56 sys
          1904492544  maximum resident set size
           240502720  peak memory footprint

```

As you can see it takes 30% less time when we max out concurrency. However, this comes at a cost i.e. the memory footprint also increases slightly, although I've found the increase to be reasonable.

### Continuous Integration

If you plan on running your tests on a CI you can leverage the following script to automatically retrieve the number of cores on the worker instance and pipe it into the flutter test command as follows
```shell
## ci_checks.sh
os_type=$(uname)  
if [[ "$os_type" == "Linux" ]]; then  
  number_of_cores=$(nproc)  
elif [[ "$os_type" == "Darwin" ]]; then  
  number_of_cores=$(sysctl -n hw.physicalcpu)  
else  
  number_of_cores=$(echo %NUMBER_OF_PROCESSORS%)  
fi

flutter test --concurrency=$number_of_cores
```


## Sharding 

If your CI doesn't cap the number of parallel jobs you can run or alternately if speed is your primary concern, you could benefit from test sharding (splitting your tests into multiple independent chunks).

Sharding consists of supplying two parameters

1. **Total Shards** : This indicates the number of subsets you wish to break the tests into.
2. **Shard Index**: This indicates the index of the subset of tests you're running.

So typically if you wish to split your test suite into two chunks and run it on two machines you could do this.

```shell
#Machine 1
flutter test --total-shards 2 --shard-index 0

#Machine 2
flutter test --total-shards 2 --shard-index 1
```


### Readability

Dart/Flutter tests use the reporter parameter to "prettify" the outputs, I've found the "github" reporter to be neat and concise as opposed to the default reporter.

```shell
#Default Reporter 

00:08 +198: /Users/anvith/Development/Flutter/pokemon-flutter/test/blocs/pokemon_overview_bloc_test.dart: verify the initial state when user has caught a pokemon                                         
[🌎 Easy Localization] [WARNING] Localization key [stories] not found
[🌎 Easy Localization] [WARNING] Localization key [stories] not found
[🌎 Easy Localization] [WARNING] Localization key [stories] not found
[🌎 Easy Localization] [WARNING] Localization key [stories] not found
00:09 +252: /Users/anvith/Development/Flutter/pokemon-flutter/test/blocs/pokemon_overview_bloc_test.dart: verify when user switches tab to view details after catching a pokemon we navigate to it                                                                                        
[🌎 Easy Localization] [WARNING] Localization key [stories] not found

```

If you run the tests with the github reporter i.e. `flutter test --reporter=github `

```shell
### Github Reporter

✅ /Users/anvith/Development/Flutter/pokemon-flutter/test/blocs/pokemon_overview_bloc_test.dart: verify the initial state when user has caught a pokemon
✅ /Users/anvith/Development/Flutter/pokemon-flutter/test/blocs/pokemon_overview_bloc_test.dart: verify when user switches tab to view details after catching a pokemon we navigate to it
```




