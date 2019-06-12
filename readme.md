# Easy Together (가제);

## 개요

-실제 서비스할 웹앱&모바일앱을 만들어보자

## 기술스택

- 모바일웹앱 first -> pwa -> 데스크톱앱 -> 하이브리드앱 (리액트네이티브) 순으로 작업예
- react (vue에 비해 숙련도가 낮다고 생각되므로 일부러 react를 채택)
- 상태관리는 mobx로.. redux는 쓸데없는 보일러플레이트가 많이 생성되는게 짜증난다.
- 백엔드/프론트 완전 분리로 api서버 테스트는 rest client나 post man 이용.
- postCss를 도입했다가 플러그인 골라 넣는게 영 아닌거 같아서 다시 sass로 회귀.
- api서버는 node+koa+mongoose로 heroku 서버에 구현 후 나중에 aws나 azure로 이전 할 계획.
