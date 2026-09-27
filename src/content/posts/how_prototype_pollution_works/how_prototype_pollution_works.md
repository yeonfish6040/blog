---
title: "How prototype pollution works"
description: "how to \"pollute prototype\""
published: 2025-04-17
tags: [node.js, prototype pollution]
category: hacking
draft: false
locales:
  en:
    title: "How prototype pollution works"
    description: "how to \"pollute prototype\""
---

:::::locale{lang=ko}
:::note
예전에 작성해놓았던 글인데 지금 올려본다
:::
:::::

:::::locale{lang=en}
:::note
This is something I wrote a while back, and I'm posting it now.
:::
:::::

<br>


# Prototype Pollution
One of the annoying part of javascript.
---
## javascript?

:::::locale{lang=ko}
웹단에서의 표준처럼 여겨짐. \
웹페이지를 동적으로 제어하기 위한 스크립트 언어 \
최근(?) node.js로 서버사이드에서도 사용되고 있음.
:::::

:::::locale{lang=en}
Treated as the de facto standard on the web. \
A scripting language for controlling web pages dynamically. \
Recently(?) it's also used server-side via Node.js.
:::::

:::::locale{lang=ko}
**node.js로 서버사이드에서 사용되고 있음**
:::::

:::::locale{lang=en}
**It is being used server-side via Node.js**
:::::

## Node.js

:::::locale{lang=ko}
JavaScript 코드를 브라우저 밖에서 실행할 수 있게 해주는 런타임 환경 \
**Javascript 엔진(V8)** 과 libuv 라이브러리로 구성되어 있음.
:::::

:::::locale{lang=en}
A runtime environment that lets you execute JavaScript code outside the browser. \
It's made up of a **JavaScript engine (V8)** and the libuv library.
:::::

:::::locale{lang=ko}
## Javascript에서의 Constructor Functions & prototype
:::::

:::::locale{lang=en}
## Constructor functions & prototype in JavaScript
:::::

:::::locale{lang=ko}
자바스크립트에서의 Class라고 생각하면 된다.
:::::

:::::locale{lang=en}
Think of them as JavaScript's classes.
:::::

```javascript
function SuperAmazingHelloWorldInitializer(name) {
  this.name = name;
}

SuperAmazingHelloWorldInitializer.prototype.HelloWorld = function () {
  console.log(`Hello World, ${this.name}!`);
}
```

```
> a = new SuperAmazingHelloWorldInitializer("yeonjun")
SuperAmazingHelloWorldInitializer { name: 'yeonjun' }
> a.HelloWorld()
Hello World, yeonjun!
```

:::::locale{lang=ko}
모든 SuperAmazingHelloWorldInitializer가 HelloWorld 메소드를 따로 생성하는 대신, \
prototype을 이용해서 메소드를 공유함 -> 메모리 절약
:::::

:::::locale{lang=en}
Instead of every SuperAmazingHelloWorldInitializer creating its own HelloWorld method, \
the method is shared via the prototype -> saves memory.
:::::

:::::locale{lang=ko}
자바스크립트의 모든 객체는 prototype을 가지고 있음.
:::::

:::::locale{lang=en}
Every object in JavaScript has a prototype.
:::::

:::::locale{lang=ko}
만약 유저가 특정 입력을 통하여 prototype에 접근하고 수정할 수 있게 된다면?\
\
code:
:::::

:::::locale{lang=en}
So what if a user could reach and modify the prototype through some input?\
\
code:
:::::

```js
function SuperAmazingHelloWorldInitializer(name) {
  this.name = name;
}

SuperAmazingHelloWorldInitializer.prototype.HelloWorld = function () {
  console.log(`Hello World, ${this.name}!`);
}

SuperAmazingHelloWorldInitializer.prototype.SayHelloToMyLittleFriend = function () {
  console.log(`Hello, ${this.littleFriend}!`);
}

user_input = {value1: "prototype", value2: "littleFriend", value3: "yeonfish"};

SuperAmazingHelloWorldInitializer[user_input.value1][user_input.value2] = user_input.value3;

a = new SuperAmazingHelloWorldInitializer("yeonjun")
a.SayHelloToMyLittleFriend()
```
result
```
> a.SayHelloToMyLittleFriend()
Hello, yeonfish!
```

:::::locale{lang=ko}
이런식으로 값을 조작할 있다.
:::::

:::::locale{lang=en}
Values can be manipulated like this.
:::::

## Object

:::::locale{lang=ko}
JS에서의 Object는 key-value 쌍으로 이루어진 데이터 구조 \
역시나 prototype을 가지고 있음.
:::::

:::::locale{lang=en}
An Object in JS is a data structure made of key-value pairs. \
It, too, has a prototype.
:::::

:::::locale{lang=ko}
악용한다면?
:::::

:::::locale{lang=en}
And if you abuse it?
:::::

```js
user = {name: "yeonjun", age: 25}

let a = {}.__proto__.isAdmin = true;

if (user.isAdmin) {
  console.log("You are admin!");
}
```
result
```
> if (user.isAdmin) {
...   console.log("You are admin!");
... }
You are admin!
```

:::::locale{lang=ko}
:::info
js의 모든 객체는 Object를 상속받는다. 즉 위처럼 prototype을 조작하면 모든 객체에 영향이 간다.
:::
:::::

:::::locale{lang=en}
:::info
Every object in JS inherits from Object. In other words, manipulating the prototype as shown above affects every object.
:::
:::::

:::::locale{lang=ko}
이런식으로 값을 조작할 있다.
:::::

:::::locale{lang=en}
Values can be manipulated like this.
:::::

:::::locale{lang=ko}
본 예제에서는 설명을 위하여 직접 prototype을 조작하였지만, \
보통 워게임에서는 merge같은 기능을 통하여 공격을 수행한다.
:::::

:::::locale{lang=en}
In this example I manipulated the prototype directly for the sake of explanation, \
but in wargames the attack is usually carried out through functionality like merge.
:::::

:::::locale{lang=ko}
## 대응법?
:::::

:::::locale{lang=en}
## How to defend?
:::::

:::::locale{lang=ko}
간단하다.
:::::

:::::locale{lang=en}
It's simple.
:::::

```javascript
Object.freeze(Object.prototype)
```

:::::locale{lang=ko}
EZ- 하게 방어할 수 있다.
:::::

:::::locale{lang=en}
You can defend against it EZ-ly.
:::::
