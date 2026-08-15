<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 이 저장소의 규칙

- 기획 문서는 `PRD.md`. 설계 결정과 근거가 §13 결정 이력에 있다. 구조를 바꾸기 전에 먼저 읽을 것.
- **개인 링크(`/my/<token>`)를 화면에 출력하지 말 것.** 이메일 채널로만 전달한다. 이유는 `PRD.md` §2 — 화면에 띄우면 남의 이메일을 입력한 사람이 그 사람의 질문 전체를 열람할 수 있다.
- **`/my/[token]/[publicNo]` 조회는 반드시 `studentId`를 함께 대조할 것.** 토큰만으로 질문을 찾으면 토큰 하나로 다른 학생의 질문이 열린다.
- 사용자 입력을 이메일 HTML에 넣을 때는 `escapeHtml()`을 통과시킬 것 (`src/lib/email.ts`). 강사 답변도 예외가 아니다.
- 질문번호 순번은 `Counter` 테이블의 원자적 증가로만 만든다. `count()` 기반 순번은 삭제 시 재사용·동시 제출 시 경합이 난다.
- 파일 업로드를 도입하지 말 것. 디스크 쓰기가 없어야 배포처를 자유롭게 고를 수 있다 (`PRD.md` §5).
- 본문 렌더링은 `.prose-block`(`white-space: pre-wrap`)을 통과시킬 것. 첨부가 없어 코드·에러 메시지가 본문으로 들어온다.
