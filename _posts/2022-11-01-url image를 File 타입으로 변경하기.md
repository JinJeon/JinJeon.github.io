---
title: url image를 File 타입으로 변경하기
categories:
  - JAVASCRIPT
feature_image: ""
feature_text: |
  파일로 갖고 있지 않은 이미지를 File 타입으로 바꾸기

# aside: true
---

프로필 이미지를 교체하기 위한 작업을 하던 중, ‘사용자가 이미지를 등록하지 않는 상황’에 대한 처리 방법이 필요해졌습니다. 현재 프로젝트를 진행하면서 백엔드와 논의를 하며 정해진 기본 조건은 ‘**사용자가 이미지를 등록하지 않는 상황에서는 기본 이미지라도 보내야 한다**’는 것이었습니다.

이를 위해서, 기본 이미지로 갖고 있던 것을 그대로 보여주면 된다는 생각만 갖고 있었습니다. 하지만, 현재 갖고 있는 기본 이미지는 **url image**로서, 이를 HTTP로 전송하기 위해서는 **File** 형태로의 변환이 필요했습니다. File로의 변환을 위해서는 File의 기반이 되는 **Blob**을 활용하여 문제를 해결할 수 있었습니다.

```tsx
export const getFileFromURL = async (url: string) => {
  const response = await fetch(url);
  // 이미지를 받아옴
  const data = await response.blob();
  // 받아온 이미지를 blob처리
  const type = url.split(".").pop();
  // test/first/image.jpg 형태에서 jpg를 가져옴
  const name = url.split("/").pop();
  // test/first/image.jpg 형태에서 image.jpg를 가져옴
  const meta = { type: `image/${type}` };
  // image로서 설정
  return new File([data], name, meta);
};
```

{% include figure.html image="/image/221101/0.png" width="75%" %}

위와 같은 형태로 Blob, File이 만들어짐을 알 수 있습니다.

{% include figure.html image="/image/221101/1.gif" width="50%" %}
