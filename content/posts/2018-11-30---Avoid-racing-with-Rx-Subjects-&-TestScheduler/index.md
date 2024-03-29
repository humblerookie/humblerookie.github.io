---
title: Avoid racing with Rx Subjects & TestScheduler
date: "2018-11-30T16:51:00.000Z"
template: post
draft: false
slug: "/posts/avoid-racing-subjects-and-testscheduler/"
category: "Android"
tags:
  - "Android"
  - "RxJava"
description: "We all use Rxjava in android and write tests, this article highlights a particular race condition which you may encounter."
socialImage: "./banner.png"
---


![Banner graphic RXjava and Android](./banner.png)

RX is a great spell but at times certain things can make you wish you had more hair on your head if you miss out on some fundamentals. Here’s one of my ‘GOTCHA’ moments.

After spending about a day or so trying to figure out why a simple test kept failing, a man was frustrated.

```kotlin
@RunWith(MockitoJUnitRunner::class)
class HairPullingTest {

    private  var testScheduler = TestScheduler()
    @Test
    fun testVodoo() {
        val subject:PublishSubject<Int> = PublishSubject.create()
        val testObserver = subject
            .subscribeOn(testScheduler)
            .observeOn(testScheduler)
            .test()
        subject.onNext(1)
        testScheduler.triggerActions()
        testObserver.assertValueCount(1)
    }
}
```

Fast forward he also realised something weird

- Substituting Subject with an Observable passes the test.
- Replacing the TestScheduler with a Trampoline scheduler also passes the test.

So something unusual is up, so he heads over to [StackOverflow](https://stackoverflow.com/questions/53519339/issue-with-publishsubject-and-testscheduler-item-isnt-emitted)
and with some help from Dávid Karnok adds an assert statement.

![Banner graphic test 1](https://miro.medium.com/max/4228/1*tGnTJBwTIjgLpTp2uPCClg.png)

![WTF](https://media.giphy.com/media/CDJo4EgHwbaPS/source.gif)

So a man goes about adding logs to his test.

```kotlin
@RunWith(MockitoJUnitRunner::class)
class HairPullingTest {

    private  var testScheduler = TestScheduler()
    @Test
    fun testVodoo() {
        val subject:PublishSubject<Int> = PublishSubject.create()
        val testObserver = subject
            .subscribeOn(testScheduler)
            .observeOn(testScheduler)
            .doOnSubscribe {
                print("I've subscribed")
            }.test()
        print("Emitting Item")
        subject.onNext(1)
        testScheduler.triggerActions()
        testObserver.assertValueCount(1)
    }
}
```

and...

![Questionable output](https://miro.medium.com/max/4784/1*lY_TJBqq7LDISWyrkCQUCQ.png)


So what’s really happening here?

![Everybody lies](https://miro.medium.com/max/1000/1*ZcpcCH-0QNJJOKCw0fz_sg.gif)


Turns out the actual subscription(_subscribeActual()_ method in _PublishSubject_) which adds the subscriber to Subject’s list of subscribers doesn’t happen until _triggerActions_ is invoked on the **TestScheduler**. This results in a race condition where even though the subscriber seems subscribed, the actual subscription and emission happen concurrently. The emission is therefore ignored due to absence of any subscribers.

The solution is to invoke _triggerActions_ immediately after subscribing and then again after emission.

```kotlin
@RunWith(MockitoJUnitRunner::class)
class DemoViewModelTest {

    private var testScheduler = TestScheduler()
    @Test
    fun testVodoo() {
        val subject: PublishSubject<Int> = PublishSubject.create()
        val testObserver = subject
            .subscribeOn(testScheduler)
            .observeOn(testScheduler)
            .test()
        testScheduler.triggerActions()
        subject.onNext(1)
        testScheduler.triggerActions()
        testObserver.assertValueCount(1)
    }
}
```


#Conclusion

Always add an extra _triggerAction()_ with your **TestScheduler** right after subscribing your subjects to ensure the subsequent emission happen as intended.
