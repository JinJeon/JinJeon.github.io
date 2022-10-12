---
title: REACT DATEPICKER
categories:
  - REACT
feature_image: ""
feature_text: |
  REACT DATEPICKER를 활용한 날짜, 시간 설정
---

날짜와 시간을 설정하는 부분에서, 기존에는 input 자체의 내장 기능으로 date와 time을 사용해 시간을 설정할 수 있도록 했었습니다.

```tsx
<S.DateInputForm type='date' value={appointmentDateTime} onChange={handelChangeDateTime} />
<S.DateInputForm type='time' value={appointmentTime} onChange={handelChangeTime} />
```

{% include figure.html
image="/image/221011/first.gif" width="35%" %}

하지만, 이렇게 설정할 경우, 브라우저 내의 date와 time 설정 방식을 사용해야 하기 때문에 추가적인 디자인 변경이 어렵다는 것을 알게 됐고, 직접 디자인이 변경한 관련 라이브러리를 찾아보니 react datepicker라는 것이 있다는 것을 알게 됐습니다.  
(링크 : [React Datepicker crafted by HackerOne](https://reactdatepicker.com/))

설치는 아래 코드들로 진행했습니다.

```
npm install react-datepicker --save
npm install @types/react-datepicker
```

---

### 날짜 설정

사용하는 방법 자체는 간단한데, 아래의 코드와 같이 datepicker를 불러와 css와 함께 삽입해주면 기본적인 datepicker의 달력이 나오게 됩니다.

```tsx
import "react-datepicker/dist/react-datepicker.css";

import ReactDatePicker from "react-datepicker";

export const StyledDatePicker = styled(ReactDatePicker)`
  border: none;
  background-color: transparent;
  padding: 0;
`;
```

```tsx
<S.StyledDatePicker
  onFocus={() => setIsDateFocused(true)}
  onBlur={() => setIsDateFocused(false)}
  onChange={handelChangeDate}
  dateFormat="yyyy.MM.dd"
/>
```

{% include figure.html
image="/image/221011/date default.png" width="50%" %}

이 달력 내의 각각의 요소마다 클래스로 지정이 되어 있어, 스타일을 변경하고자 하는 부분의 클래스를 따라 들어가 원하는 스타일로 CSS 작업을 진행하면 됩니다.

```tsx
.react-datepicker {
	&__day {
	  ${fonts.xSmall};
	  color: ${colors.grey4};
	  width: calc(100% / 10);
	  aspect-ratio: 1;
	  line-height: initial;
	  display: inline-flex;
	  align-items: center;
	  justify-content: center;
	  margin: 0;

	  :hover {
	    border-radius: 10rem;
	  }

	  &-name {
	    ${fonts.xSmall};

		...

	  &--disabled {
	    text-decoration: line-through;
	    color: ${colors.grey3};
	  }
	}


```

날짜 설정과 관련된 스타일 작업을 하면서 약간의 어려움을 느꼈던 부분은 이전 ∙ 다음 달로 넘어가는 화살표의 디자인을 설정하는 것이었는데, 현재 설정 월을 표시해주는 헤더(`react-datepicker__current-month`)와 같은 선상에 있으면서 `position: absolute`로 포지셔닝이 되어 있어, 이는 헤더와 같은 값을 `top`으로 직접 받아 처리하도록 우선 구성했습니다.

```tsx
&__current {
  &-month {
    text-align: left;
    padding-left: calc(100% * 7 / 80 - 5px);
    padding-bottom: 0.5rem;
    padding-top: 0.75rem;
  }
}

&__navigation {
	  &--previous {
	    top: 5px;
	    left: unset;
	    right: calc(32px);
	  }
	  &--next {
	    top: 5px;
	    right: 0px;
	  }
	  &-icon {
	    ::before {
	      border: none;
	    }
		}
	}
}
```

datepicker의 기능을 위한 설정도 필요했는데, 대표적으로 선택된 날짜 지정, 날짜 표현 형식 변경, 주 단위 변경 등이 있었습니다. 다행히 datepicker 내에 이와 관련된 기능들이 포함되어 있어, 이를 찾아 적용해주었습니다.

```tsx
<S.StyledDatePicker
  selected={new Date(appointmentDateTime)}
  // 선택된 날짜를 지정
  onFocus={() => setIsDateFocused(true)}
  // 기존 input과 동일
  onBlur={() => setIsDateFocused(false)}
  // 기존 input과 동일
  onChange={handelChangeDate}
  // 기존 input과 동일
  dateFormat="yyyy.MM.dd"
  // input에 보이는 날짜 형식 설정
  minDate={new Date()}
  // 최소 선택 가능 날짜 지정. 이전 날짜는 선택이 안 됨
  showPopperArrow={false}
  // 말풍선처럼 꼬리가 붙어있는 것을 보여줄지 여부를 결정
  formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
  // 주 단위를 어떤 식으로 보여줄지 결정. 여기서는 Wed => W로 변경
  nextMonthButtonLabel={<Icon iconName="ChevronRight" iconSize={0.75} />}
  // 다음 달 보기 버튼 표현방식 변경
  previousMonthButtonLabel={<Icon iconName="ChevronLeft" iconSize={0.75} />}
  // 이전 달 보기 버튼 표현방식 변경
/>
```

{% include figure.html
image="/image/221011/date finish.gif" width="50%" %}

### 시간 설정

시간을 설정하는 부분도 동일한 방식으로 적용하려 했으나, 가장 큰 문제점은 기본적인 datepicker 내의 시간 디자인과 우리의 디자인이 시간 설정 방식 면에서 다르다는 점이었습니다.

<div style="display: flex">
  {% include figure.html
  image="/image/221011/time design.png" width="65%" %}
  {% include figure.html
  image="/image/221011/time default.png" width="100%" %}
</div>

왼쪽이 디자인 상의 시간 설정이고, 오른쪽이 datepicker에서 제공하는 시간 설정입니다. 이 경우, 디자인을 바꾼다고 해도 좌측과 같은 설정 방법을 만들 수가 없어, 시간 설정과 관련된 라이브러리를 한 번 더 찾아 적용해야 한다는 부담이 생겼습니다.

시간 설정과 관련된 여러 라이브러리들을 찾아봤지만, 좌측과 같은 시간 설정 방식을 제공하는 라이브러리를 찾는 데에는 한계가 있었습니다. 또한, 현재 진행해야 할 다른 부분들이 많이 남아 있어, 시간 설정 부분에만 더 많은 시간을 할애하기에 어려움이 많아 datepicker의 시간 설정을 최대한 비슷한 디자인으로 수정하는 것으로 방법을 바꾸었습니다.

```tsx
export const StyledTimePicker = styled(ReactDatePicker)`
  width: 100%;
  border: none;
  background-color: transparent;
  padding: 0;

  :focus {
    outline: none;
  }
`;

...

&__header {
  padding: 0;
  &--time {
    background-color: transparent;
    border-bottom: none;
  }
}

&-time__header {
  ${flexCenter};

  justify-content: left;
  width: 100px;
  word-spacing: 10px;
  margin: 0 auto;
  white-space: pre;
  font-size: 8px;
  font-weight: 400;
  height: 25px;
  color: ${colors.grey4};
}

...
```

```tsx
<S.TimeInputWrapper isTimeFocused={isTimeFocused}>
  <S.StyledTimePicker
    onChange={handleChangeTimeTest}
    // 기존 input과 동일
    timeIntervals={timeIntervals}
    // 시간 설정의 간격을 조절함
    showTimeSelect
    showTimeSelectOnly
    // 시간 설정만 보여주도록 설정. 위 두 가지를 모두 입력해야 함
    selected={currentTimeDateType}
    // 선택된 시간에 selected 클래스를 지정함
    showPopperArrow={false}
    timeFormat="HH mm aa"
    value={appointmentTime}
    timeCaption="HOUR MINUTE"
    onFocus={() => setIsTimeFocused(true)}
    onBlur={() => setIsTimeFocused(false)}
  />
  <Icon iconName="ChevronDown" iconSize={0.9} />
</S.TimeInputWrapper>
```

날짜 설정을 할 때와 동일한 방식으로 스타일을 구성했으며, 이로 인한 어려움은 크게 없었습니다.

단, 시간 설정을 할 때에는 `showTimeSelect`, `showTimeSelectOnly` 이 두 가지 설정을 넣어주어야 시간 설정에 대한 창만 나오게 되므로 이를 주의할 필요가 있었습니다.

시간 설정도 같은 방식의 스타일을 적용해 문제를 해결했으며 이 라이브러리 덕분에 input과 관련된 디자인 설정 시 드는 어려움을 줄일 수 있었습니다.

{% include figure.html
  image="/image/221011/time finish.gif" width="45%" %}

### 특이 사항

스타일 관련 작업들을 진행하면서, `!important`를 사용해야 할 상황이 종종 생겼습니다. 이는 datepicker 내에서 디자인 설정을 하며 우선 적용된 부분들이 있어, 이를 건드리기 위한 것이었습니다. `!important`를 사용할 경우 추후 수정 작업 때 문제가 될 수 있어 사용을 피해야하지만, 이 부분에 대한 특별한 해결책은 아직 찾아내지 못했습니다.
