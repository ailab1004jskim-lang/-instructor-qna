# 강사 질문방

수강생이 강사에게 질문을 남기고, 강사가 한 곳에서 답변하는 비동기 Q&A 웹앱.

- 기획: [PRD.md](./PRD.md)

## 기술 스택

Next.js 16 (App Router) · Prisma 7 + PostgreSQL · Tailwind CSS v4 · Resend(이메일)

파일 업로드가 없어 디스크에 종속되지 않는다. Vercel·Railway 등 어디든 배포 가능 (PRD §5).

## 로컬 실행

```bash
npm install
cp .env.example .env      # DATABASE_URL 등 채우기
npm run db:dev            # 마이그레이션 생성 + 적용
npm run db:seed           # 질문 유형 4종 시드
npm run dev               # http://localhost:3000
```

### 환경변수

| 변수 | 설명 |
|---|---|
| `DATABASE_URL` | PostgreSQL 연결 문자열. 서버리스 배포 시 커넥션 풀러 엔드포인트 사용 |
| `ADMIN_PASSWORD` | 강사 최초 로그인 비밀번호. 로그인 후 설정에서 바꾸면 DB 해시가 우선 |
| `SESSION_SECRET` | 세션 쿠키 서명용 랜덤 문자열 |
| `RESEND_API_KEY` | 비우면 이메일 발송을 건너뛴다(로컬 개발) |
| `EMAIL_FROM` | 발신 주소 (기본 `onboarding@resend.dev`) |
| `APP_BASE_URL` | 메일 링크의 절대 URL. 비우면 요청 헤더에서 유추 |

> **로컬 개발 주의** — `RESEND_API_KEY`가 비어 있으면 개인 링크 메일이 나가지 않는다.
> 설계상 링크는 메일로만 전달하므로, 로컬에서는 `npm run db:studio`로 `Student.token`을
> 확인해 `/my/<token>`으로 직접 접근한다.

## 화면

| 경로 | 접근 | 설명 |
|---|---|---|
| `/` | 공개 | 질문 제출 폼 |
| `/submitted/[publicNo]` | 공개 | 제출 완료 (개인 링크는 노출하지 않음) |
| `/my/[token]` | 토큰 | 내 질문 목록 |
| `/my/[token]/[publicNo]` | 토큰 + 소유권 검증 | 질문 상세 + 답변 |
| `/link` | 공개 | 개인 링크 재발송 |
| `/admin/login` | 공개 | 강사 로그인 |
| `/admin` | 강사 | 대기 질문 + 집계 + 필터 |
| `/admin/questions/[id]` | 강사 | 답변 작성 · 삭제 |
| `/admin/topics` | 강사 | 질문 유형 관리 |
| `/admin/settings` | 강사 | 서비스명 / 알림 이메일 / 비밀번호 |

## 설계상 지켜야 할 것

`AGENTS.md`에 정리돼 있다. 특히 개인 링크를 화면에 노출하지 않는 규칙과
`/my/[token]/[publicNo]`의 소유권 대조는 보안 요구사항이므로 임의로 바꾸지 말 것.
