---
title: mouse click event 자동 발생 문제
categories:
  - JAVASCRIPT
feature_image: ""
feature_text: |
  컴퓨터 브라우저에서 mouse up event 시 mouse click event가 자동 발생하는 문제
---

{% include figure.html
  image="/image/221017/1.gif" width="75%" %}

슬라이딩 애니메이션을 구현하며, 위와 같이 슬라이딩을 할 때 클릭이 되지 않도록 기능을 적용했습니다. 하지만 이는 모바일에서만 적용이 되었는데, 컴퓨터 브라우저에서는 아래와 같이 `mouseclick` 이벤트가 동작해, 다른 링크로 넘어가게 되는 문제가 발생했습니다.

{% include figure.html
  image="/image/221017/2.gif" width="75%" %}

위 그림과 같이 클릭 이벤트를 처리해야하는 상황에서 슬라이딩 되는 요소에 `mouseclick` 이벤트와 `mouseup` 이벤트가 모두 적용될 시, `mouseclick` 이벤트가 실행되는 것이 문제점이었습니다. 원인은 `mouseclick`이 `**mousedown`, `mouseup`이 같은 요소에 대해 이루어질 시 나타나는 이벤트\*\*이기 때문이었습니다.

이로 인해, `mouseclick` 이벤트 핸들러에 이러한 상황을 구분할 수 있는 구분점(여기서는 움직임의 유무)을 두는 것으로서 처리를 해줄 수 있었습니다. 현재 `mouseup` 이벤트가 실행되고 나면 애니메이션이 그 다음으로 실행되고, 이 애니메이션이 종료되는 것을 통해 움직임과 관련된 옵션이 끝났다는 것을 알려주도록 했습니다.

```tsx
const handleAnimationEnd = () => {
  if (moving === 'right') setMoving(null);
};
// 애니메이션이 종료되는 시점에 움직이는 작업이 끝나, 작업이 없다는 것을 설정해줍니다.

<S.InnerWrapper
  ref={wrapperRef}
  ...
  onAnimationEnd={handleAnimationEnd}
	// 애니메이션이 끝나면 해당 함수가 실행되도록 합니다.
>
```

그리고 클릭 이벤트 내에는, 움직이는 작업이 없는 경우에만 클릭 이벤트로 다른 작업을 할 수 있도록 설정했습니다.

```tsx
const handleClickItem = () => {
  if (moving) return;
  // 움직임이 남아있을 경우 다음 작업을 하지 않습니다.
  navigate(`${pathName.chatroomDetail}/${id}`, { state: { chatRoomMemberId } });
};
```

`mouseclick`과 `mouseup`을 함께 사용할 때에는 위와 같이 click만이 구분되어 실행될 수 있도록 하는 옵션을 주어, 처리를 해야 원하는 처리가 가능하다는 것을 알 수 있었습니다.

{% include figure.html
  image="/image/221017/3.gif" width="75%" %}
