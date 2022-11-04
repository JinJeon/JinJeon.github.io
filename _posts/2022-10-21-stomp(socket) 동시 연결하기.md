---
title: stomp(socket) 동시 연결하기
categories:
  - REACT
feature_image: ""
feature_text: |
  stomp(socket)를 사용하는 곳들이 한 번에 연결되도록 설정하기
---

### 이전 코드의 문제점

기존에 `stomp`를 통한 socket 연결 시, socket에 연결되는 것들의 종류에 따라 나누어 `stompClient`를 직접 만들어 적용하는 방식을 사용하고 있었습니다.

그로 인해 아래 사진과 같이 socket 연결을 두 번 진행하게 됐고, 이는 불필요한 연결을 반복하는 결과가 나오게 했습니다.

{% include figure.html
image="/image/221021/6.png" %}

코드로는 아래와 같은 형태가 나오게 되며, 아래의 함수들을 각각 호출해 적용하는 형식이었습니다.

```jsx
export const chatroomSocket = () => {
  const sockServer = `${process.env.REACT_APP_BASE_URL}/${WEBSOCKET}`; // 들어갈 주소 설정
  const sock = new SockJs(sockServer);
  const stompClient = StompJs.over(sock);
	// 해당 부분에서 stompClient를 계속해서 새로 생성하게 됨

  const subscribeChat = ({ onReceive, chatroomId, chatroomIds }: subscribeParamsType) => {
    const headers = getAuthHeaders();
    const subscribeToStomp = (id: string | number) => {
      const subscribeURL = `/${TOPIC}/${CHATROOM_MEMBERS}/${id}`;
      stompClient.subscribe(subscribeURL, onReceive, headers);
    };

    if (chatroomId) subscribeToStomp(chatroomId);
    if (chatroomIds) chatroomIds.forEach((id) => subscribeToStomp(id));
  };

export const noticeSocket = () => {
  const sockServer = `${process.env.REACT_APP_BASE_URL}/${WEBSOCKET}`; // 들어갈 주소 설정
  const sock = new SockJs(sockServer);
  const stompClient = StompJs.over(sock);
	// 해당 부분에서 stompClient를 계속해서 새로 생성하게 됨

  const subscribeNotice = ({
    entryIds,
    keywordIds,
    onSubscribeEntries,
    onSubscribeKeywords,
  }: subscribeParamsType) => {
    const subscribeURL = `/${QUEUE}/${NOTIFICATIONS}`;
    const headers = getAuthHeaders();

    if (!!entryIds.length) {
      entryIds.forEach((id) => {
        stompClient.subscribe(subscribeURL + `/${ENTRIES}/${id}`, onSubscribeEntries, headers);
      });
    }
```

{% include figure.html
image="/image/221021/7.png" %}

### 'stompClient' 하나만 사용하기

이 부분에서 `stompClient`를 하나만 호출하고, 이를 전체 `App`에서 연결, 구독, 연결 해제 등의 작업을 해야했습니다. 이를 위해 `stompClient`가 호출되는 위치를 상단으로 바꾸고, 이를 `export`하는 작업부터 진행했습니다.

```jsx
const sockServer = `${process.env.REACT_APP_BASE_URL}/${WEBSOCKET}`; // 들어갈 주소 설정
const sock = new SockJs(sockServer);
export const stompClient = StompJs.over(sock);
```

위와 같이 하나의 `stompClient`만을 생성하고, 이를 `export`해, 이 `stompClient`만을 이용해 소켓 연결을 할 수 있도록 했습니다. 그 다음 `stompClient`를 갖고 바로 구독을 하거나 연결을 하는 등의 행위를 할 수 있었습니다.

```jsx
export const subscribeChat = ({
  onReceiveChat,
  chatroomId,
  chatroomIds,
}: subscribeChatParamsType) => {
  const subscribeToStomp = (id: number) => {
    const subscribeURL = `/${TOPIC}/${CHATROOM_MEMBERS}/${id}`;
    const headers = getAuthHeaders();
    const { id: stompId } = stompClient.subscribe(subscribeURL, onReceiveChat, headers);
		// stompClient를 바로 가져다 쓰도록 설정
		...

export const connectStomp = ({ noticeParams, chatParams }: ConnectStompParamsType) => {
  const headers = getAuthHeaders();
  try {
    // stompClient.debug = () => null; 이후 console로 나오는 stomp 관련 내용 제거에 사용
    stompClient.connect(headers, () => {
		// stompClient에 바로 연결
      subscribeNotice(noticeParams);
      subscribeChat(chatParams);
			// 연결이 완료될 시, 바로 Notice, Chat의 구독 시 행위를 지정함
			...
```

이 작업을 통해서 위 그림과 달리 아래처럼 하나의 `stompClient`만을 갖고 원하는 모든 알림, 채팅을 구독할 수 있었습니다.

{% include figure.html
image="/image/221021/8.png" %}

### 새로운 채팅의 내용 가져오기

기존에 채팅을 사용할 때에는, 채팅 상세 페이지에서 직접 소켓에 다시 한 번 연결하는 과정을 거치며, 그 과정에서 채팅 데이터 목록을 업데이트하는 코드를 직접 주입하는 방식으로 이루어졌었습니다.

```jsx
// 채팅 상세 페이지 내 새로운 채팅을 받는 함수
const getNewChatMessage = (chatData: StompJs.Message) => {
  const newChat = JSON.parse(chatData.body);
  // 새로운 채팅을 소켓으로부터 직접 받아(StompJs.Message), 기존 리스트에 업데이트 해주는 방식으로 되어 있음
  setCurChats((chats) => {
    const newChats = [...chats, newChat];

    return newChats;
  });
  scrollToBottom();
};

useEffect(() => {
  const { disconnectChatroom, connectChatroom } = chatroomSocket();
  connectChatroom({ onReceive: getNewChatMessage, chatroomId });
  // 소켓에 직접 연결 및 채팅 받을 시 실행할 함수를 적용
  return () => disconnectChatroom();
  // 채팅방 나갈 시 소켓 연결 제거
}, []);
```

{% include figure.html
image="/image/221021/9.png" %}

하지만, 소켓을 한 번 연결하고, 채팅방에 들어올 때 별도의 소켓 연결을 더 하지 않으려면, 기존의 연결을 통해 바뀌는 값을 따로 저장해줄 필요가 있었습니다. 이를 처리하기 위해 기존에 사용하던 recoil의 `atom`을 통해서 값을 저장하는 store를 만들었습니다.

```tsx
export type ChatroomsUpdate = {
  id?: number;
  chat?: ChatroomDetailChatType;
  trigger: number;
  // 같은 chat이 들어온 경우에 대한 구분이 필요해, trigger를 통한 구분을 하도록 설정
};

export const chatUpdateState = atom<ChatroomsUpdate>({
  key: "chatUpdate",
  default: { trigger: 0 },
});

// stomp 연결 시, 새로운 채팅이 들어오면 실행할 콜백함수의 hooks
export const useOnReceiveChat = () => {
  const setChatsUnreadTrigger = useSetRecoilState(chatsUnreadTrigger);
  // 읽지 않은 채팅 개수를 다시 구할 때 쓰는 trigger
  const setChatUpdate = useSetRecoilState(chatUpdateState);
  // chat update를 다시 설정해주는 함수

  return (chatDate: StompJs.Message) => {
    const { body, headers } = chatDate;
    // 새로운 stomp message에서 필요한 정보들을 파싱
    const chat = JSON.parse(body);
    const id = Number(headers.destination.split("/").at(-1));
    setChatsUnreadTrigger((prev) => prev + 1);
    // 채팅 개수가 변하므로 읽지 않은 채팅 개수 다시 불러오기
    setChatUpdate(({ trigger }) => ({ chat, id, trigger: trigger + 1 }));
    // chat update를 stomp를 통해 들어온 값들로 변경
  };
};
```

그리고 이 `chatUpdate`라는 store의 값이 바뀔 시, 이를 인지하고 자신의 정보인지를 확인한 뒤, 자신의 채팅 정보에 넣어주는 함수를 구성했습니다.

```tsx
const {
  id: updatedId,
  chat: updatedChat,
  trigger: chatUpdateTrigger,
} = useRecoilValue(chatUpdateState);
// store 정보를 불러옴

...

useEffect(() => {
  if (chatroomId !== updatedId || !updatedChat) return;
	// id값이 일치하지 않거나 정보가 없을 시 바로 리턴
  setCurChats((chats) => [...chats, updatedChat]);
	// 새로 받은 채팅 정보를 기존 채팅 정보에 추가
  scrollToBottom();
}, [chatUpdateTrigger]);
// 메세지를 받을 때마다 trigger를 통해 확인이 가능함
```

{% include figure.html
image="/image/221021/10.png" %}

### 채팅 보내기

기존 코드에서는 채팅을 보내는 상황에 대해서도 먼저 소켓을 새로 만들어 그 곳에서 채팅을 보내는 방법을 사용했었습니다.

```tsx
const sockServer = `${process.env.REACT_APP_BASE_URL}/${WEBSOCKET}`; // 들어갈 주소 설정
const sock = new SockJs(sockServer);
const stompClient = StompJs.over(sock);

export const sendChat = ({ contents, chatroomId }: SendChatParamsType) => {
  const headers = getAuthHeaders();
  const sendingURL = `/${APP}/${CHATROOMS}/${chatroomId}/${CHAT}`;

  stompClient.send(sendingURL, headers, JSON.stringify({ contents }));
};
```

하지만, 위에서 살펴본 바와 같이, 한 번의 소켓 연결을 통해 문제를 해결했기 때문에, 현재 새롭게 사용될 `sendChat` 또한 이전 코드와 동일하지만, 같은 `stompClient`를 사용하게 됩니다.

{% include figure.html
image="/image/221021/11.png" %}

```tsx
const handleSubmit = (event: FormEvent) => {
	...
  sendChat({ contents: chatValue, chatroomId });
};
```

`submit`을 통해 채팅 입력을 완료하는 경우, 원하는 값과 `id`를 넣어 메세지를 보낼 수 있습니다.

### 새로운 채팅 생성 후 바로 들어갈 때

이 경우, 소켓에 해당 채팅에 대한 아이디가 구독되어 있지 않은 상황이라 채팅을 입력해도 바로 정보를 가져오지 못했습니다. 이를 해결하기 위해서 새로운 채팅에 들어가는 순간, 해당 채팅에 대한 stomp id를 찾고, 해당 값이 없는 경우 이전에 설정해둔 `chatMap`에서 값을 가져와 구독을 해주도록 했습니다.

```tsx
import { chatMap, subscribeChat } from '@socket/stomp';
import { useOnReceiveChat } from '@socket/useConnectSocket';
...
const stompId = chatMap.get(chatroomId);
// 해당 채팅 아이디에 대한 stomp id 값을 구함
...
useEffect(() => {
  // when use question chat in share detail page
  if (!stompId) subscribeChat({ onReceiveChat, chatroomId });
	// stomp id가 없을 시, 기존에 만든 onReceiveChat과 현재 채팅 아이디를 갖고 stomp에 구독
	...
  };
}, []);
```

이를 통해 새로운 채팅이 생성될 경우에 대해서도 채팅이 바로 이루어질 수 있도록 처리했습니다.

<div style="display: flex">
{% include figure.html
image="/image/221021/12.gif" width="55%"%}
{% include figure.html
image="/image/221021/13.gif" width="55%"%}
</div>
