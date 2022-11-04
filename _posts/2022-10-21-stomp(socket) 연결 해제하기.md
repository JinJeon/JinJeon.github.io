---
title: stomp(socket) 연결 해제하기
categories:
  - REACT
feature_image: ""
feature_text: |
  불필요한 stomp(socket) 연결 해제하기
---

현재 소켓을 통해 채팅 연결을 지속하고 있었습니다. 이러한 상황에서 특정 채팅방을 나가는 경우, 해당 채팅방에 대한 알림은 더 이상 받을 필요가 없기 때문에 소켓을 유지한 상태에서 특정 소켓만 해제하는 작업이 필요했습니다.

### 같은 id가 반복되는 문제

소켓 연결 해제를 하기에 앞서, 연결 해제를 위해서는 `id`값이 필요한데, 소켓 연결 시 현재 같은 `id` 값으로만 연결을 해주는 상황입니다.

{% include figure.html
image="/image/221021/1.png" %}

구독하는 상황에서 이는 `headers`를 직접 넣어주는 경우 해결이 됩니다.

```tsx
const subscribeToStomp = (id: string | number) => {
  const headers = getAuthHeaders();
  const subscribeURL = `/${TOPIC}/${CHATROOM_MEMBERS}/${id}`;
  stompClient.subscribe(subscribeURL, onReceive, headers);
};
```

{% include figure.html
image="/image/221021/2.png" %}

처음에는 `stompClient.unsubscribe`를 사용하기 위해 필요한 `id`값을 빼내는 데에 필요하다고 판단해 이와 같은 상황을 먼저 만들었으나, 구독을 하는 동시에 생성되는 값에서 `id`,`unsubscribe()`가 존재한다는 것을 발견했습니다.

{% include figure.html
image="/image/221021/3.png" %}

현재 의문점으로 갖고 있는 것은, 같은 `id`를 갖고 있는 상황에서도, 저 `unsubscribe()` 함수를 쓰는 상황에서는 각각을 분리해 구독을 끊는 것인지, 아니면 같은 `id`를 갖고 있는 것들에 대해 모두 구독을 끊는 것인지 입니다. 이에 대한 제대로 된 문서를 찾기 어려워 직접 적용을 해보게 됐습니다.

---

### ‘sub-0’ id들로만 이루어진 곳에 구독을 끊을 시

{% include figure.html
image="/image/221021/4.png" %}

‘sub-0’ id로만 이루어진 소켓에 연결을 끊는 작업을 진행할 시, 이후 들어오는 메세지에 대해 위 사진과 같은 결과를 알려주게 됩니다. ‘sub-0’라는 id를 통해 들어온 또 다른 메세지가 있으며, 이 메세지에 대해 핸들링이 이루어지지 않았음을 알려주게 되어, 원하는 기능을 위해서는 정확하게 id값이 분리되어야 한다는 것을 알 수 있었습니다.

앞서 나와있던 `unsubscribe()` 함수 역시 결국 해당 `id`값에 대해서 구독 해제를 하는 것이라 판단했고, `id`를 저장해 필요한 `id`를 꺼내 쓰기로 결정했습니다.

---

### id를 직접적으로 넣어주어 구독 끊기

위의 방법이 안 된다는 것을 알고난 뒤, 소켓의 연결을 끊기 위해 사용할 방법들을 찾아봤습니다. 현재 연결된 stomp(소켓)내에서 연결이 이루어지는 경우(`stompClient.subscribe`)에 리턴하게 되는 `id`값들을 가지고 있어야하는데, 이 값들을 담아두고, 필요할 때 바로 꺼내서 사용하기 위해 JS의 `Map`을 사용해 이 값들을 정리해주게 됐습니다.

```jsx
export const chatMap = new Map<number, string>();
// id에 맞는 stompId값을 바로 빼내게 위해 map을 사용

const subscribeToStomp = (id: number) => {
  const subscribeURL = `/${TOPIC}/${CHATROOM_MEMBERS}/${id}`;
  const headers = getAuthHeaders();
  const { id: stompId } = stompClient.subscribe(subscribeURL, onReceiveChat, headers);
	// 구독이 완료될 시 나오는 stomp id값을 꺼냄
  chatMap.set(id, stompId);
	// 채팅방의 id값에 stomp id값을 대입시켜서 저장함
};
```

위와 같은 방법을 통해 채팅방의 `id`를 알고 있으면 stomp에 연결된 stomp id를 빼낼 수 있게 되고, 그 stomp id를 통해 stomp 연결을 해제할 수 있게 됩니다.

```tsx
const handleClickSelectOkBtn = async () => {
  // 채팅을 나갈 때 사용하는 함수
  if (!deletedId) return;
  const { id, chatRoomMemberId } = deletedId;
  // 필요한 id값들을 받아옴
  const response = await deleteChatroomData(id);
  if (response.status === 200) {
    // 서버에서 채팅을 나갔다는 응답이 올 경우
    const stompId = chatMap.get(chatRoomMemberId);
    // 해당 stompId를 받아옴
    unsubscribeStomp(stompId);
    // id를 통해 구독 해제
    setChatroomsTrigger((trigger) => trigger + 1);
    setDeletedId(null);
  }
  setIsSelectModal(false);
};
```

{% include figure.html
image="/image/221021/5.png" %}
