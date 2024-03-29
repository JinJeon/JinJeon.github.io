---
title: textarea 줄바꿈 시 자동 스크롤
categories:
  - REACT
feature_image: ""
feature_text: |
  React에서 textarea 줄바꿈 시 자동 스크롤이 되도록 만들기
aside: true
---

## textarea 태그 내 줄바꿈 시 문제점

`textarea` 태그를 적용하면서, 줄바꿈이 발생하는 경우 기존에 `input` 태그를 쓸 때에는 겪지 못했던 문제가 있었습니다. `input` 태그는 한 줄로만 이어져 줄바꿈이 없었지만, `textarea`는 줄바꿈을 할 때 아래 사진과 같이 아래로 뻗쳐지는 글자(’j’, ‘g’)가 아래로 튀어나와 다음 영역을 간섭했습니다. 이는 스크롤이 최하단까지 내려가지 않는 것에서 문제가 비롯되었습니다.

{% include figure.html
image="/image/221026/1.png" width="75%" %}

이러한 문제를 해결하기 위한 방법으로 처음에는 `line-height`를 적용해봤으나, 이 방법을 적용해도 위와 같은 상황이 바뀌지는 않았습니다.

## 스크롤을 최하단으로 내리기

이를 해결하기 위해서 ‘글자가 하단으로 내려가는 상황’을 가려낼 필요가 있었습니다. 현재 적용된 textarea에서는 ‘Shift + Enter를 누를 때’, ‘글자가 일정 너비를 넘어갈 때’ 총 두 가지 경우에서 줄 바꿈이 발생했습니다. 그리고 이 줄 바꿈이 발생할 시, 스크롤이 자동적으로 내려가게 되었습니다. 그래서 스크롤을 강제적으로 최하단까지 내리면 간섭이 사라지게 되므로, 줄바꿈 상황 시 스크롤을 내리는 기능을 우선 만들어주었습니다.

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);
// textarea 태그를 받아오기 위한 ref

const handleScrollTextarea = () => {
  // scroll이 발생하는 상황 시
  if (!textareaRef.current) return;
  textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  // 스크롤의 위치를 textarea의 최하단으로 옮김
};

<S.ChatTextarea
  ref={textareaRef}
  onScroll={handleScrollTextarea}
  // 스크롤 발생 시 함수 적용
  placeholder="메시지를 입력하세요."
/>;
```

하지만, 이렇게 진행할 경우, 한 가지 문제가 발생하게 되는데, 스크롤 하는 상황에서 강제로 높이 지정을 하다보니 작성할 채팅을 스크롤로 올려보고 싶을 때 이 상황이 불가능했습니다.

{% include figure.html
image="/image/221026/2.gif" width="75%" %}

## 특정 상황에서만 스크롤을 강제로 내리기

위 문제를 해결하기 위해서, 스크롤을 강제로 내리는 상황을 지정해주어야 했습니다. 스크롤이 강제로 내려가야되는 상황은 ‘타이핑을 통해 줄이 바뀔 때’와 ‘Enter + Shift 키를 누를 때’ 뿐이므로, 이 두 상황이 발생한 뒤에는 다시 스크롤이 가능하도록 지정해주면 되었습니다.

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);
const scrollWithTypingRef = useRef(false);
// 스크롤이 타이핑으로 인해 발생할 시 true가 될 ref
const typingTimeoutRef = useRef<NodeJS.Timeout>();
// 타이핑이 연속으로 발생할 시, 이전 set timeout을 삭제하기 위한 ref

/** handler for type key */
const handleChangeChatValue = (event: ChangeEvent<HTMLTextAreaElement>) => {
  const { inputType } = event.nativeEvent as any;
  if (inputType === 'insertLineBreak') return;
  setChatValue(event.target.value);

  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  // 타이핑이 연속적으로 발생할 경우, 이전 set timeout을 제거 (Debounce)
  scrollWithTypingRef.current = true;
  // 타이핑으로 스크롤이 발생할 수 있으므로 true로 설정
  typingTimeoutRef.current = setTimeout(() => (scrollWithTypingRef.current = false), 500);
  // 0.5초 내에 타이핑이 다시 발생하지 않을 경우, 타이핑으로 스크롤이 발생하지 않을 것이므로 false로 설정
};

/** handler for type 'Enter' key */
const handleKeyDownChat = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  const { key, shiftKey, keyCode } = event;
  // 'keyCode' is deprecated but error occurs when just use 'key' in korean

  if (key !== 'Enter' || keyCode !== 13) return;
  if (!shiftKey) {
    sendCurChat();
  } else {
    scrollWithTypingRef.current = true;
    // Enter + Shift 키가 적용된 상황에서 스크롤이 발생할 것이므로 true로 미리 설정
    setChatValue(chatValue + '\n');
    // 줄바꿈 추가를 통해 스크롤을 발생시킴
  }
};

/** handler for auto scroll during typing */
const handleScrollTextarea = () => {
  if (!textareaRef.current || !scrollWithTypingRef.current) return;
  textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
  scrollWithTypingRef.current = false;
  // 스크롤이 발생했으므로, 다시 false로 설정
};

return (
  ...
  <S.ChatTextarea
    ref={textareaRef}
    rows={1}
    spellCheck={false}
    value={chatValue}
    onKeyDown={handleKeyDownChat}
    onChange={handleChangeChatValue}
    onScroll={handleScrollTextarea}
    placeholder='메시지를 입력하세요.'
  />
  ...
)
```

위 코드로 인해 자동 스크롤이 발생하는 순서는 아래와 같습니다.

1. ‘Enter + Shift’ 또는 타이핑으로 인해 줄바꿈이 발생
2. 줄바꿈 이전에 실행된 입력으로 인해 `scrollWithTypingRef.current = true;` 설정
3. `onScroll`에서 `scrollWithTypingRef.current = true;`여부 확인
4. `true`일 시 자동 스크롤 발생
5. `scrollWithTypingRef.current = false;`로 설정

## 결과

위 설정들을 통해서 스크롤을 발생시킬 수 있었고, 아래 그림과 같이 줄바꿈이 발생할 때 자동 스크롤로 채팅을 간섭없이 보여줄 수 있었습니다.

{% include figure.html
image="/image/221026/3.gif" width="75%" %}
