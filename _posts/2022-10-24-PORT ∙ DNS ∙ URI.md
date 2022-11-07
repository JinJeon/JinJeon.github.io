---
title: PORT ∙ DNS ∙ URI
categories:
  - HTTP
feature_image: ""
feature_text: |
  HTTP의 기본적인 PORT ∙ DNS ∙ URI 알아보기
---

> 해당 내용은 [모든 개발자를 위한 HTTP 웹 기본 지식](https://www.inflearn.com/course/http-웹-네트워크/dashboard) 강의를 수강하여 작성했습니다.

## PORT

PORT란 IP 내 프로세스 구분을 위해 사용하는 번호입니다. 보통 한 번에 둘 이상의 애플리케이션을 연결해야하는 상황에서 사용합니다.  
통신을 주고 받으면서 패킷이 오는 경우, 해당 패킷이 어느 곳에서 오는 패킷인지를 구분해야하는 문제가 발생합니다. 이 상황에서 **데이터를 전송할 목적지 서버를 찾는 것이 IP, 서버 내에서 구분된 애플리케이션을 찾는 것이 PORT라고 볼 수 있습니다.**

{% include figure.html
image="/image/221024/Untitled-13.png" width="50%" %}

### PORT의 특징

1. 같은 IP 내 프로세스 구분
   - 아래 예시와 같이, 80포트로 클라이언트가 메세지를 보내고, 서버에서는 10010번 포트로 응답을 보내게 되면, 포트를 뒤에 붙여서 같이 보내게 됩니다.
   - 이 상황에서 IP는 아파트, PORT는 몇 동 ∙ 몇 호라고 생각할 수 있습니다.

{% include figure.html
image="/image/221024/Untitled-14.png" %}

2. 0 - 65535가 할당 가능
3. 1023까지는 잘 알려져서 일반적으로 사용하지 않음
   - FTP : 20,21
   - TELNET : 23
   - HTTP : 80
   - HTTPS : 443

---

## DNS

DNS는 Domain Name System의 줄임말로, 호스트 도메인 이름을 호스트의 네트워크 주소로 바꾸거나 그 반대의 변환을 수행하기 위해 개발되었습니다.  
일종의 전화번호부와 같은 역할을 수행하며, IP가 숫자로만 이루어져 기억하기 어려운 것과 달리 특정 이름을 갖고 있어 기억을 하기에 용이합니다.  
접근을 원하는 경우 도메인 명으로 DNS 서버에 먼저 접근한 뒤, 해당 IP를 받아올 수 있습니다.

{% include figure.html
image="/image/221024/Untitled-15.png" %}

---

## URI

URI는 Uniform Resource Identifier의 줄임말로, 특정 리소스를 식별하는 역할을 수행합니다.

### URI, URL, URN의 차이

URI 내에 URL(로케이터 : locator), URN(이름 : name) 두 가지가 존재합니다.  
URL은 리소스가 있는 위치를 지정하고, URN은 리소스에 자체적인 이름을 부여하는데, 이로 인해 URN 이름만으로 실제 리소스를 받는 방법이 보편화 되지 않아 URL을 주로 사용하게 됩니다.

{% include figure.html
image="/image/221024/Untitled-16.png" %}

### URL의 특징

- 전체 문법 : scheme://[userInfo@]host:[:port]/[/path][?query][#fragment]
- scheme
  - 주로 프로토콜이 사용되며 자원 접근 규칙으로서, http, https 등이 존재합니다.
  - http는 80, https는 443 포트를 주로 사용하며 이들은 생략이 가능합니다.
    (https는 http에 보안이 추가된 형태)
- userInfo : URL에 사용자 정보를 포함해서 인증할 때 사용하나, 거의 사용되지 않습니다.
- host : 도메인명, IP 주소를 직접 넣어서 사용합니다.
- port : 접속 포트로, 일반적으로 웹 브라우저에서 생략이 가능합니다.
- path : 리소스 경로를 나타내며 계층적 구조로 이루어지며, ‘`profile/1223`’ 과 같은 형태를 띕니다.
- query : key=value의 형태로 이루어지며, ?로 시작하고 &으로 추가가 가능합니다. query parameter, query string(모두 문자로 넘어가기 때문에) 등으로 불립니다.
- fragment : html 내부 북마크 등에 사용합니다. 서버로 전송되지는 않습니다.

---

## URI 접속 흐름

{% include figure.html
image="/image/221024/Untitled-17.png" %}

1. DNS 조회, PORT 조회
2. HTTP 요청 메시지 생성
3. Socket Library에서 handshake 과정을 통해 서버와 연결
4. 데이터 전송
5. 서버가 HTTP 응답 메시지 생성
6. 응답 패킷이 클라이언트에 도착
7. 클라이언트에서 해당 내용으로 렌더링
