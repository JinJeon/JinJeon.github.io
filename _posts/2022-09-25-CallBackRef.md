---
title: 자동 스크롤을 위한 React의 Callback Ref
categories:
  - REACt
feature_image: ""
feature_text: |
  자동 스크롤을 위한 React의 Callback Ref
---

채팅을 구현하는 상황에서, 채팅의 경우 첫 렌더링 시 무조건 가장 하단의 채팅부터 보여주어야 하기 때문에, 이를 위해서 렌더링 후 바로 채팅의 하단을 보여주는 것을 구현했습니다.

이 상황에서 기존에는 두 가지 방법을 사용했습니다.

1. `window`의 `scroll` 기능 사용하기
2. `useEffect`와 `ref`를 적용해 보여주기

```jsx
window.scrollTo(0, document.body.offsetHeight);
```

두 방법 중 처음에는 위와 같이 1번의 방법을 사용했으나, 리액트의 특성을 살리지 못한다는 판단이 들어(`document.body`와 같은 부분에서), 2번의 방법을 시도했었습니다.

`useEffect`를 사용하고, 의존성에 `ref`를 부여하는 방법으로 원래 해결을 하려고 했으나, 이는 올바르지 않은 방법임을 곧 알게 됐습니다.

왜냐하면, 렌더링을 건너뛰는`useEffect` 의 경우, 컴포넌트가 다시 렌더링이 이루어질 때까지 `ref`가 업데이트 된 것을 확인할 수가 없기 때문입니다. 즉, 이미 설정된 `ref`에 대해서는 `useEffect` 내부의 메소드가 작동하지만(원래 한 번 동작하므로), 이후에는 `ref`의 변경이 있어도, 그 순서가 `useEffect`보다 늦다면, 의존성 배열에 담아주어도 전혀 반응하지 않습니다.

즉, `ref`를 `useEffect`에 넣는 것은 렌더링이 모두 이루어진 다음에 수행하는 데에 적합하지 않은 방식이기 때문에, `ref`의 지정에 따른 메소드를 수행하는 방법이 필요했습니다.

그 과정에서 발견한 것이 `callback ref`라는 개념인데, 이는 React에 기본적으로 내장된 기능으로서, React Element의 `ref` props에 `useCallback`으로 설정된 함수를 넣어주는 경우, 해당 React Element가 파라미터가 되어, 해당 함수를 실행하게 됩니다.

```tsx
//**callback ref for scroll to bottom */
const scrollToBottomRef = useCallback((lastChatDiv: HTMLDivElement) => {
  if (!lastChatDiv) return;
  // change target only if last chat didn't exist
  setLastChat((prevLastChat) => (prevLastChat ? prevLastChat : lastChatDiv));
  lastChatDiv.scrollIntoView({ block: "end" });
}, []);
```

위 함수가 해당 기능을 하는 함수인데, 위와 같이 lastChatDiv라는 element를 받는 함수를 만들어, 해당 함수 내에 원하는 기능이 이루어지도록 했습니다.

위 함수를 통해, 처음에 페이지에 진입하는 상황에 대해서 지정된 요소(가장 하단 요소)로 스크롤이 이루어지도록 만들었습니다.

```tsx
return (
  <S.Wrapper>
    <S.Date>2021년 5월 29일</S.Date>
    <S.Chats>
      {chatroomLogs}
      <S.EmptyBlock ref={scrollToBottomRef} />
      // 최하단에 만들어지는 빈 블록으로, 이 곳에 설정을 해주어 이 곳에 이동이
      되도록 합니다.
    </S.Chats>
  </S.Wrapper>
);
```
