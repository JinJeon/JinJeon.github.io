---
title: React 개발 시 https 사용하기
categories:
  - ALGORITHM
feature_image: ""
feature_text: |
  React 개발 시 https 사용하기

# aside: true
---

### https로 넘어가게 된 이유

현재 개발 중인 앱을 배포하며, 기존에 http로 되어있던 api들을 https로 변경해주었습니다. 이에 따라 배포된 페이지는 https로 이루어져 api를 정상적으로 받아왔지만, 오히려 개발 중에는 http를 사용 중이어서 아래와 같은 에러가 나왔습니다.

사파리의 경우, SSL 오류로 인해 동작 자체가 멈추었고, 크롬에서는 기본적인 동작은 하나, api를 받아오는 단계를 진행하지 못하는 것을 볼 수 있었습니다.

{% include figure.html image="/image/221115/1.png" width="100%" %}

{% include figure.html image="/image/221115/2.png" width="100%" %}

기존에 개발을 진행할 때에는 CORS를 피하기 위해 http-proxy-middleware를 사용했습니다. 하지만, 현재 상황에서는 따로 이전과 같은 방법이 필요가 없다는 것을 알게 되었고, 현재 개발 환경 상에서 localhost를 https로 설정해주면 된다는 결론을 내렸습니다.

### package.json 설정

기본적으로 http가 아닌 https로 개발 환경을 설정합니다. 아래와 같이 https로 이동할 수 있도록 합니다.

```json
"scripts": {
  "start": "HTTPS=true react-app-rewired start",
  // HTTPS를 적용
},
```

하지만, 아래와 같은 에러가 나오는 것을 볼 수 있는데, 이는 연결이 안전하지 않기 때문에 문제가 되어 에러가 나오는 것으로, 이를 해결하기 위해서 SSL 인증서를 만들어주어야 합니다. 여기서는 `mkcert`라는 것을 이용해 인증서를 만들었습니다.

{% include figure.html image="/image/221115/3.png" width="100%" %}

### mkcert 사용하기

인증서 생성을 위한 인증 기관을 만들기 위해 `mkcert`를 설치하게 됩니다. 아래 코드들을 통해서 설치할 수 있습니다.

```
brew install mkcert
// brew로 mkcert 설치

mkcert -install
// mkcert를 컴퓨터에 설치
```

{% include figure.html image="/image/221115/4.png" width="100%" %}

{% include figure.html image="/image/221115/5.png" width="100%" %}

그리고 현재 사용 중인 React의 root 디렉토리에 `.cert`라는 디렉토리를 만든 뒤, 내부에 인증서를 만들어 넣어줍니다.

```
mkdir -p .cert
// .cert라는 디렉토리를 생성

mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "localhost"
// 인증서를 만들어 넣어줌.
```

{% include figure.html image="/image/221115/6.png" width="100%" %}

{% include figure.html image="/image/221115/7.png" width="100%" %}

그리고 만들어진 디렉토리는 개발 단계에서만 사용되기 때문에, `.gitignore`로 커밋 제외해줍니다.

{% include figure.html image="/image/221115/8.png" width="100%" %}

마지막으로, React가 시작될 시, SSL 인증서를 포함하도록 하기 위해 아래와 같은 형식의 코드로 `package.json`에 작성합니다.

```json
"scripts": {
  "start": "HTTPS=true SSL_CRT_FILE=./.cert/cert.pem SSL_KEY_FILE=./.cert/key.pem react-app-rewired start",
  // CRT FILE, KEY FILE을 갖고 실행하도록 설정
  ...
},
```
