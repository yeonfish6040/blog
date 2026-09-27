---
title: "Bypassing URL Validation with Prototype Pollution"
description: "Prototype pollution can cause Node.js’s internal module url's isURL method to always return true for any object."
published: 2025-03-22
tags: ["node.js", "prototype pollution", "node.js internal"]
category: hacking
draft: false
locales:
  en:
    title: "Bypassing URL Validation with Prototype Pollution"
    description: "Prototype pollution can cause Node.js’s internal module url's isURL method to always return true for any object."
---

:::::locale{lang=ko}
:::important
악용하지 말것
:::
:::::

:::::locale{lang=en}
:::important
Do not abuse this.
:::
:::::

# Introduction.

:::::locale{lang=ko}
Node.js의 URL 모듈은 node.js의 internal 모듈중 하나로, fs나 http 모듈등에서 사용된다.
이러한 URL 모듈을 분석하던 중, 취약점을 발견하여 글을 적어본다.
:::::

:::::locale{lang=en}
Node.js's URL module is one of Node.js's internal modules, used by the likes of the fs and http modules.
While analyzing that URL module I found a vulnerability, so here's a write-up.
:::::

# Vulnerable Vectors

:::::locale{lang=ko}
node.js의 URL 모듈 안에는 `fileURLToPath`, `toPathIfFileURL` 메소드가 있다. 각 메소드의 공통점은 똑같이 URL 모듈 안에 있는 `isURL`이라는 메소드를 사용한다는 것이다.
바로 이 `isURL`이라는 메소드에서 취약점이 발생하는데,
:::::

:::::locale{lang=en}
Node.js's URL module contains the `fileURLToPath` and `toPathIfFileURL` methods. What they have in common is that both use a method inside the same URL module called `isURL`.
The vulnerability lives in that very `isURL` method:
:::::

```js
function isURL(self) {
  return Boolean(self?.href && self.protocol && self.auth === undefined && self.path === undefined);
}
```

:::::locale{lang=ko}
바로 URL 모듈의 필드값의 존재 여부만 확인한다는 것이다.
:::::

:::::locale{lang=en}
It only checks whether the URL object's fields exist.
:::::

:::::locale{lang=ko}
즉 URL 객체를 선언할때, 아무 오브잭트만 넣고, 위에 나와있는 필드 값만 적당히 만져주면 URL로 인식한다는 것이다.
:::::

:::::locale{lang=en}
In other words, you can pass any old object in place of a URL and, as long as you tweak the fields shown above appropriately, it will be recognized as a URL.
:::::
