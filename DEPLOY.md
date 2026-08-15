# 배포 절차 (Vercel + GitHub)

CLI 설치 없이 웹 화면만으로 진행한다.
이 환경에서는 `gh` 설치가 권한 승인 창에서 멈추고, `vercel login` 은 한글 경로/장치명 때문에
인코딩 오류가 나므로 웹 경로를 기본으로 삼는다.

---

## 1. GitHub 저장소 만들기

1. https://github.com/new 접속
2. 입력
   - Repository name: `instructor-qna`
   - **Private** 선택 (반드시)
   - **"Add a README file" 등 체크박스는 전부 해제** — 이미 로컬에 커밋이 있어 충돌한다
3. **Create repository** 클릭
4. 다음 화면에 나오는 주소를 복사 (`https://github.com/<계정>/instructor-qna.git`)

## 2. 로컬 코드 올리기

터미널에서 실행한다. `<계정>` 부분만 본인 것으로 바꾼다.

```powershell
cd "D:\07.AI(웹)\instructor-qna"
git remote add origin https://github.com/<계정>/instructor-qna.git
git branch -M main
git push -u origin main
```

처음 push 할 때 브라우저 로그인 창이 뜬다(Git Credential Manager). GitHub 계정으로 승인하면 된다.

## 3. Vercel 에 연결

1. https://vercel.com 접속 → **Sign up** → **Continue with GitHub**
2. **Add New… → Project**
3. 방금 만든 `instructor-qna` 저장소 옆 **Import** 클릭
4. Framework Preset 이 **Next.js** 로 자동 인식되는지 확인 (빌드 명령은 건드리지 않는다)
5. **Environment Variables** 를 펼쳐 아래 6개를 입력 (§4 참조)
6. **Deploy** 클릭

## 4. Vercel 에 넣을 환경변수

| Key | Value |
|---|---|
| `DATABASE_URL` | 로컬 `.env` 의 **`DATABASE_URL`** 값 그대로 (`-pooler` 가 붙은 주소) |
| `DIRECT_URL` | 로컬 `.env` 의 **`DIRECT_URL`** 값 그대로 (`-pooler` 없는 주소) |
| `ADMIN_PASSWORD` | **새로 정한 강한 비밀번호.** 로컬의 `admin1234` 를 쓰지 말 것 |
| `SESSION_SECRET` | 아래 명령으로 새로 생성한 값. 로컬 값 재사용 금지 |
| `RESEND_API_KEY` | Resend 에서 발급받은 `re_...` 키 |
| `EMAIL_FROM` | 도메인 인증 전이면 `onboarding@resend.dev` |

`APP_BASE_URL` 은 처음엔 비워둔다. 배포 주소가 정해진 뒤 §6 에서 넣는다.

**SESSION_SECRET 생성** (PowerShell):
```powershell
-join ((1..48) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
```

## 5. DB 스키마 반영

Vercel 빌드는 `prisma generate` 만 하고 마이그레이션은 적용하지 않는다(운영 DB를 빌드가 임의로
바꾸지 않도록 의도한 것). 로컬에서 한 번 적용한다.

```powershell
cd "D:\07.AI(웹)\instructor-qna"
npm run db:migrate
npm run db:seed
```

로컬 `.env` 가 이미 운영과 같은 Neon DB를 가리키고 있으므로 그대로 실행하면 된다.
이미 적용돼 있으면 "up to date" 로 끝난다.

## 6. 배포 주소 반영

1. 배포가 끝나면 `https://instructor-qna-xxxx.vercel.app` 형태의 주소가 나온다
2. Vercel → Settings → Environment Variables 에서 `APP_BASE_URL` 에 그 주소를 넣는다
3. Deployments 탭에서 최신 배포를 **Redeploy**

이 값이 비어 있으면 요청 헤더에서 주소를 유추하므로 대개 잘 동작하지만,
메일 링크를 확실히 고정하려면 명시하는 편이 안전하다.

## 7. 배포 후 점검

| 확인 | 기대 결과 |
|---|---|
| `/` 접속 | 질문 폼이 뜨고 유형 4종이 보인다 |
| `/admin/login` | 새로 정한 `ADMIN_PASSWORD` 로 로그인된다 |
| 로그인 후 설정 | 알림 수신 이메일을 등록한다 |
| 질문 1건 제출 | 강사 메일로 알림이 온다 |
| `/robots.txt` | `/my/`, `/admin`, `/submitted/` 가 Disallow 로 나온다 |

**첫 로그인 직후 `/admin/settings` 에서 비밀번호를 한 번 더 바꿀 것.**
DB 해시가 환경변수보다 우선하므로, 이후에는 `ADMIN_PASSWORD` 환경변수가 무력화된다.

## 8. 이후 수정 반영

```powershell
git add -A
git commit -m "수정 내용"
git push
```

push 하면 Vercel 이 자동으로 새로 배포한다.

---

## 주의

- **`.env` 는 절대 커밋하지 않는다.** `.gitignore` 에 이미 제외돼 있다.
- 운영용 `ADMIN_PASSWORD` 와 `SESSION_SECRET` 은 로컬 값과 반드시 다르게 한다.
- 스키마를 바꾼 뒤에는 `npm run db:migrate` 를 직접 실행해야 운영 DB에 반영된다.
  push 만으로는 반영되지 않는다.
