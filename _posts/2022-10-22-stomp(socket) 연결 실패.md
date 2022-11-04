---
title: stomp(socket) 연결 실패 시 알림
categories:
  - REACT
feature_image: ""
feature_text: |
  socket 연결 실패 시 사용자에게 보여줄 컴포넌트 만들기
---

현재 socket과 관련된 작업을 하면서 socket이 연결됐을 때에 대한 처리는 모두 완료가 되었으나, socket이 처음부터 연결되지 않은 상황에 대해서는 작업이 이루어지지 않았습니다. 이로 인해 사용자는 채팅, 알림 등 socket이 연결되지지 않은 상황임을 인지하지 못하고 계속 서비스를 이용하게 되어 문제가 발생합니다. 그래서 socket이 처음부터 연결되지 않거나, 중간에 끊긴 상황에 대한 알림을 줄 수 있어야 합니다.

### socket의 연결 여부를 확인하는 방법

우선적으로 socket이 연결 여부를 확인하는 값이 필요했습니다. 그래서 socket에 직접적인 socket 연결 여부를 확인하는 값을 가져오고자 했었습니다.

```jsx
export const stompClient = StompJs.over(sock);
```

위 코드를 입력한 후, 해당 값을 console을 통해 확인해보면, 아래와 같이 connected라는 값이 있고, 이 값을 통해서 연결 여부를 확인해줄 수 있습니다.

{% include figure.html
image="/image/221022/1.png" %}

하지만, socket의 첫 연결은 무조건적으로 `false`에서 시작하기 때문에, 위 `connected`가 바뀌는 것을 따로 기다린 후 원하는 결과를 만드는 것보다, 연결이 된 후에 실행할 수 있는 콜백함수를 넘기는 것이 더 낫다는 판단을 했습니다. 그리고 socket이 연결되었음을 확인할 수 있는 상태(atom)를 하나 갖는 것도 필요하다고 판단했습니다.

```tsx
// 소켓 연결 여부를 갖고 있는 atom
export const socketConnectState = atom<boolean>({
  key: "socketConnect",
  default: false,
});
```

```tsx
export const stompClient = StompJs.over(sock);
...

type ConnectStompParamsType = {
  noticeParams: subscribeNoticeParamsType;
  chatParams: subscribeChatParamsType;
  onConnect: () => void;
  onError: () => void;
};

export const connectStomp = ({
  noticeParams,
  chatParams,
  onConnect,
  onError,
}: ConnectStompParamsType) => {
  const headers = getAuthHeaders();
  try {
		// stompClient로 성공적으로 연결될 경우 첫번째 콜백, 에러가 나올 시 두번째 콜백이 실행됨
    stompClient.connect(
      headers,
      () => {
        onConnect();
        subscribeNotice(noticeParams);
        subscribeChat(chatParams);
      },
      () => {
        onError();
      },
    );
  } catch (error) {
    console.log(error);
  }
};
```

```tsx
const setSocketConnect = useSetRecoilState(socketConnectState);
// 소켓 연결여부를 확인하는 atom을 불러옴
...
connectStomp({
	// 연결 성공, 실패 여부에 따라 atom의 값이 바뀌도록 설정
  onError: () => setSocketConnect(false),
  onConnect: () => setSocketConnect(true),
  noticeParams: {
    entryIds,
    keywordIds,
    onSubscribeEntries: onSubscribeNotice,
    onSubscribeKeywords: onSubscribeNotice,
  },
  chatParams: { chatroomIds, onReceiveChat },
});
```

위와 같은 방식을 통해 소켓의 연결 성공, 실패에 따른 atom 값의 설정이 가능해졌습니다. 하지만, 여기서 발생한 또 다른 문제점은 정상적으로 연결이 되는 상황에 대해서도 처음에는 `false` 값을 갖고, 이후 연결이 된 상황에서 `true`값을 갖는다는 점입니다.

{% include figure.html
image="/image/221022/2.gif" %}

`true`값을 가짐으로 인해, 연결 유무를 갖고 보일지에 대한 유무를 갖고 있는 컴포넌트는 처음에 보였다가 사라지는 형태로 유지됩니다.

### 연결 상태의 초기값을 ‘true’로 할 때의 문제점

이를 해결하기 위한 방법으로, 처음에 `true`로 설정된 뒤, 연결이 잘못된 상황이 발생할 때에만 `false`가 나오는 것을 고려했습니다. 하지만, 이 방법으로 진행할 시, 이후 이 연결 여부를 갖고 즉각적인 행동을 하게 되는 다른 컴포넌트가 존재할 때 문제가 발생하기 때문에, `true`를 초기값으로 설정하는 것을 자제했습니다.

그래서 이후 결정한 방법은 사용하는 컴포넌트 내에서 시간 제한을 두는 방법을 쓰게 됐습니다.

### 자체적인 시간 제한을 두어 연결 여부 확인하기

현재 연결 여부를 사용하는 컴포넌트 `TopFixedWarning`에서 자체적인 연결 여부 관련 상태를 둠으로써 문제를 해결할 수 있었습니다. 거기에, 이 컴포넌트에서만 따로 시간 제한을 두어 일정 시간이 지난 상황에서도 연결이 제대로 되지 않은 경우 연결이 되지 않았다는 상태로 바뀌도록 설정했습니다.

```tsx
const waitingCheckTime = 5000; // ms

const TopFixedWarinng = ({
  text,
  isShowed,
  otherStyle,
}: TopFixedWarningPropsType) => {
  const socketConnect = useRecoilValue(socketConnectState);
  // 앱 전체적으로 사용하는 소켓 연결 여부 상태를 가져옴
  const [isConnected, setIsConnected] = useState(true);
  // 현재 컴포넌트에서만 사용하는 연결여부 확인 상태
  const [timeOver, setTimeOver] = useState(false);
  // 시간 초과 여부를 확인하는 상태

  const handleClickEvent = () => {
    window.location.reload();
  };

  // 앱에서의 소켓 연결 상태에 변화가 있을 시, 동시에 시간이 이미 초과한 상황에서 자체적인 소켓 연결 여부를 지정할 수 있게 함
  useEffect(() => {
    if (!timeOver) return;
    setIsConnected(socketConnect);
  }, [socketConnect]);

  // time out을 설정해, 일정 시간이 지나간 경우 timeover 상태를 true로 바꾸고 소켓 연결 여부를 현재 컴포넌트에 알림
  useTimeout(() => {
    setTimeOver(true);
    setIsConnected(socketConnect);
  }, waitingCheckTime);

  return (
    <S.Wrapper
      isShowed={isShowed || !isConnected} // 자체적으로 받은 props와 자체적인 연결 여부 상태를 통해 보여줄 지에 대한 여부를 지정함
      otherStyle={otherStyle}
      onClick={handleClickEvent}
    >
      <Icon iconName="Warning" iconSize={1.25} />
      <S.TextWrapper>{text}</S.TextWrapper>
    </S.Wrapper>
  );
};
```

컴포넌트 내에 자체적인 연결 상태를 지정해준 이유는 소켓 연결 시간이 사용자의 예상 시간보다 긴 경우, 사용자가 소켓과 관련된 기능이 동작하지 않는다는 것을 예상하지 못한 채 계속 활동을 이어갈 수 있기 때문에, 자체적인 연결 상태 지정(`isConnected`)과 시간 초과 여부(`timeover`)를 두어 특정 시간(여기서는 5초)이 지날 시 소켓의 상태를 즉각 반영하도록 설정했습니다.

{% include figure.html
image="/image/221022/3.gif" %}

위와 같이 특정 시간(5초)가 지나가면 소켓이 연결되지 않을 시 문제가 있음을 알려줄 수 있게 됩니다.
