---
title: localStorage와 json.parse의 타입
categories:
  - JAVASCRIPT
feature_image: ""
feature_text: |
  localStorage와 json.parse 사용 시 타입 지정하기
---

`localStorage`를 사용하게 되는 경우, `localStorage`의 값을 가져올 때 필연적으로 `json.parse()`를 사용하게 됩니다. 이러한 상황에서, `localStorage` 내부의 값이 예상과 다른 타입으로 결과가 나오게 되면, 이에 대한 에러를 처리해야 합니다.

하지만, `json.parse()`의 기본적인 리턴 타입 설정은 `any`로 되어있어, 리턴 타입을 한 번 더 확인하는 과정이 필요하다고 판단했습니다.

기존에는 `localStorage` 내부의 값을 가져오는 동시에 `json.parse()`를 진행했었으나, json.parse()를 하는 과정에서 바로 타입을 확인하고 그 결과에 따라 `localStorage`의 리턴값을 설정해야 하기 때문에, `json.parse()`를 위한 함수를 우선 따로 만들고자 했습니다.

### json.parse에 대한 함수 만들기

가장 먼저 해당 함수를 통해 나오게 되는 결과값을 설정하고자 했고, 아래와 같이, 파싱 후 해당 값과 성공 여부가 나올 수 있도록 설정했습니다.

```tsx
type ParseResult<T> =
  | { parsedValue: T; isSuccess: true }
  | { parsedValue?: undefined; isSuccess: false };
```

그리고, `json.parse()`를 통해 나온 결과값이 예상한 결과값과 일치하는 지를 확인하기 위한 함수가 함께 주입되어야했는데, 이를 위해서 타입 가드로서의 역할을 하는 함수의 타입도 지정해주었습니다. 그리고 해당 타입들을 토대로, `json.parse()`를 한 값에 대한 타입을 확인하고 결과를 알려주는 함수를 만들었습니다.

```tsx
export type ParseGuardType = (typeTarget: any) => boolean;

// 기대값에 대한 타입과 타입 가드를 함께 주입
export const getParseResult =
  <T,>(guard: ParseGuardType) =>
  (value: string): ParseResult<T> => {
    const parsedValue = JSON.parse(value);
    return guard(parsedValue)
      ? { parsedValue, isSuccess: true }
      : { isSuccess: false };
  };
```

### localStorage에서 값을 가져오는 함수 만들기

위에서 만든 `getParseResult` 함수를 이용해, `localStorage`로 부터 가져온 값을 파싱해서 결과가 있을 경우, 해당 결과를 보여주도록 설정할 수 있었습니다.

```tsx
export const getLocalStorageInfo =
  // 위와 동일하게 기대하는 타입과 타입 가드를 위한 함수 주입


    <T,>(parseGuard: ParseGuardType) =>
    ({ key }: { key: LocalStorageKeyType }) => {
      const data = window.localStorage.getItem(key);
      // 파싱 전의 localStorage 데이터를 가져옴

      try {
        // 가져온 데이터가 존재하는 경우, 데이터를 파싱해서 리턴함
        const info = data && getParseResult<T>(parseGuard)(data);
        if (info && info.isSuccess) {
          return info.parsedValue;
        } else {
          // 실패 상황에 대한 에러 처리
        }
      } catch (error) {
        // 관련 에러 처리
      }

      return null;
    };
```

### 만들어진 함수 활용하기

위에서 만든 함수를 활용해 localStorage 내의 access token을 가져올 시, 아래와 같은 형식으로 작성해 가져올 수 있습니다. 현재, access token은 파싱 후 문자열로서 리턴되어야하기 때문에, 문자열 여부를 확인하는 함수를 작성하고, 이를 함수에 대입해 사용하는 형태를 취했습니다.

```jsx
export const getIsString = (data: any) => {
  return typeof data === "string";
};

const accessToken =
  getLocalStorageInfoTest < string > getIsString({ key: "access-token" });
headers[AUTHORIZATION] = `${accessToken}`;
```

### 한계점

현재 위 예시와 같이, 문자열을 확인하는 과정에 대해 string이라는 값과 getIsString이라는 함수를 각각 대입해서 사용해야 하는 문제가 있습니다. 불필요한 두 번의 주입이라는 생각이 들어, getIsString과 같은 함수를 문자열 뿐만이 아니라 다른 타입들에 대한 확인도 모두 가능하도록 설정하는 함수를 만들어야 할 필요가 있습니다.
