---
title: https 내 http 요청 시 자동 전환
categories:
  - HTML
feature_image: ""
feature_text: |
  https내에서 적용되지 않는 http 요청 처리하기

# aside: true
---

### http 요청의 문제점

배포 주소와 서버의 API 주소를 https로 바뀐 뒤 실행을 했을 경우, 기존에 카카오 이미지를 크롬에서는 잘 가져오지만 사파리에서는 제대로 가져오지 못하는 문제가 있었습니다. 이 문제는 크롬에서는 자동으로 http 요청을 https로 바꾸어 요청을 보내지만, 사파리에서는 그 기능을 수행하지 못하는 것이 원인이었습니다.

{% include figure.html caption="사파리에서 http로 되어 막혔다는 경고" image="/image/221121/0.png" width="100%" %}

{% include figure.html caption="크롬에서 http를 https로 자동 변경했다는 경고" image="/image/221121/1.png" width="100%" %}

{% include figure.html caption="사진을 받아오지 못해 보여주지 못하는 모습" image="/image/221121/2.png" width="100%" %}

### http를 https로 바꾸기

이를 해결하기 위해서는 서버의 API를 바꿨듯이, 서버에서 받아오는 이미지의 링크도 https로 바꾸는 방법이 있었습니다. 하지만, 이 이미지의 링크같은 경우, http와 https에서 요청 시 동일한 결과가 나오기 때문에, 클라이언트에서 http를 https로 바꾸는 방법을 사용하게 됐습니다.

이러한 경우, HTML 자체적으로 해결이 가능한데, HTML의 'meta' 태그에서 <a href="https://developer.mozilla.org/ko/docs/Web/HTML/Element/meta#attr-http-equiv">'http-equiv'</a> 속성을 설정하여 해결할 수 있습니다. 링크의 설명에 나와있듯, http 헤더를 설정하는 역할을 하며, 이번에는 여기서 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy">'content-security-policy'</a>라는 속성을 사용했습니다. 이 속성은 **관리자가 자신의 페이지에 가져올 수 있는 리소스를 제어**하는 역할을 합니다.

여기서 제어를 위해 사용한 것은 <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/upgrade-insecure-requests">'upgrade-insecure-requests'</a>로, 아래 사진에 나와 있듯, http로 된 것들은 요청을 보내기 전에 https로 처리하고 요청을 보냅니다. 이 때, https로 사용할 수 없는 경우, http로 다시 보내지 않고 요청이 실패했다는 결과를 보여주게 됩니다.

{% include figure.html image="/image/221121/3.png" width="100%" %}

앞서 말했듯, 현재 사용 중인 http의 경우, 카카오톡에서 받아온 이미지 링크들이며 이들은 https로 대체가 되기 때문에 사용이 가능했습니다. 그래서 아래와 같은 코드를 추가해주어 문제를 해결할 수 있었습니다.

```html
<meta
  http-equiv="Content-Security-Policy"
  content="upgrade-insecure-requests"
/>
```

{% include figure.html caption="카카오를 통해 받아온 이미지가 정상적으로 나옴" image="/image/221121/4.png" width="100%" %}
