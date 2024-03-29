---
title: Exploring Recent Kotlin APIs
date: "2020-07-18T16:51:00.000Z"
template: "post"
draft: false
slug: "/posts/exploring-recent-kotlin-apis/"
category: "Kotlin"
tags:
  - "Kotlin"
  - "Android"
description: "We take a look at some of the more prominent api changes in Kotlin 1.3.7x and 1.4.x preview releases."
socialImage: "./banner.png"
---

![Banner graphic Kotlin](banner.png)

The recent releases of Kotlin have brought about a rich set of APIs particularly the upcoming `1.4` release. Let's take a dive into some of the more prominent changes.

## Fun Interfaces: SAM Conversions

Starting `1.4`, Kotlin allows us to use a more idiomatic lambda syntax for SAM classes written in Kotlin. So your typical interfaces can be prefixed with `fun` which allows for a neat little lambda instantiation as shown below.

```kotlin
//fun keyword is allowed on interfaces
fun interface Parser {
    fun parse(value: String): ParsedOutput
}

data class ParsedOutput(val header: String, val body: String)
```

Below is a comparison of the old and new instantiation.

```kotlin
fun oldInstantiation() {
   val defaultParser = object : Parser{
      override fun parse(value: String): ParsedOutput {
         require(value.length > 4)
         ParsedOutput(value.substring(0, 3), value.substring(3, value.length))
      }
   } 
}

fun newInstantiation() {
    val defaultParser = Parser { value ->
        require(value.length > 4)
        ParsedOutput(value.substring(0, 3), value.substring(3, value.length))
    }
}
```

So instead of using the `oldInstantation` which has a lot of boilerplate, we now have neat little lambda for our anonymous `Parser` instance as shown in `newInstantiation`.


##Delegate to another property

Kotlin `1.4` allows us to delegate a property initialization to another property. This allows us to rename or refactor fields without breaking the API for existing consumers.

A simple example would be where a field is renamed

```kotlin
class Vehicle {
   var id: Int = 0
   @Deprecated("Use 'id' instead", ReplaceWith("id"))
   var vehicleId: Int by this::id
}
```

Notice how we've renamed this field without breaking the contract with the classes that have been using this field.

There is an interesting side effect of this API, let's say we had a class `Vehicle` with only two types a `car` and a `cycle`. We initially decided to model this with a single **boolean** called `isCar`.

```kotlin
class Vehicle(val isCar:Boolean)
```

However we realise later that we need to build more variants of these vehicles and need to remodel the data type. We can couple the new feature of delegating to another property along with a small extension function to achieve it.

```kotlin
class Vehicle(val type: VehicleType = CYCLE) {

    @Deprecated("Use 'type', instead", ReplaceWith("type"))
    val isCar: Boolean by this::type

    @Deprecated("Use constructor with 'type' info instead")
    constructor (isCar: Boolean) : this(if (isCar) CAR else CYCLE)
    
    enum class VehicleType {
        CYCLE, CAR, TRUCK, SHIP
    }

    private operator fun KProperty<*>.getValue(
        vehicle: Vehicle,
        property: KProperty<*>
    ): Boolean {
        return vehicle.type == CAR
    }
}


fun main() {
    val vehicle = Vehicle(TRUCK)

    //Below line would throw a deprecated warning
    println(vehicle.isCar)
}
```

The extension function is merely a way to overload the [getter for the delegate](https://kotlinlang.org/docs/reference/operator-overloading.html#property-delegation-operators). One thing to note is while this syntax may seem more appealing you'd be better served using the `get/set` methods. This is because the extension method can get murkier when more properties start using it. So I recommend using the code below for complicated deprecations instead.

```kotlin
class Vehicle(var type: VehicleType = CYCLE) {

    @Deprecated("Use constructor with 'type' info instead")
    constructor (isCar: Boolean) : this(if (isCar) CAR else CYCLE)

    @Deprecated("Use 'type', instead", ReplaceWith("type"))
    var isCar: Boolean = false
        get() = type == CAR
        set(value) {
            field = value
            type = if (value) CAR else CYCLE
        }

    enum class VehicleType {
        CYCLE, CAR, TRUCK, SHIP
    }
}
```


## Standard library additions

- `scan` : This operator was added to the collections framework. Its essentially the equivalent of using `fold` with a `map` operation. `scan` returns a transformed version of the current collection where the transforming lambda has access to the *accumulated* value in order to compute the new value. Here's an illustration from the official documentation.
![Scan diagram](https://blog.jetbrains.com/wp-content/uploads/2020/02/kotlin-scanFold.gif)

- **Builders**: `buildList`, `buildMap` are efficient ways to build read only lists and maps respectively for cases where the members aren't straightforward or need to be computed from multiple sources. Here's how you'd use it 
```kotlin
 val allowedDisplayCodes = buildList<Int> {
        addAll(currentDisplayCodes)
        add(selectedCode)
        addAll(discounts.map { it.itemCode })
  }
```

There are a few more additions, you can check the entire list [here](https://github.com/JetBrains/kotlin/blob/1.3.70/ChangeLog.md#new-features-5).
##Parting thoughts
Both `1.4` and `1.3.7x` releases have introduced some neat changes which we can make use of especially in the standard library. Do give them a go.