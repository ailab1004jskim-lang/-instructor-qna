/**
 * 사용자가 입력한 본문을 개행 그대로 보여준다.
 * 첨부가 없는 설계라 에러 메시지·코드가 이 블록으로 들어온다.
 */
export function Prose({
  children,
  mono = false,
  className = "",
}: {
  children: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`prose-block ${mono ? "prose-mono" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  value,
}: {
  label: string;
  hint?: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-sub mb-1.5">
        {label}
        {hint ? <span className="ml-1.5 font-normal">· {hint}</span> : null}
      </p>
      <div className="rounded-lg bg-bg border border-line px-3.5 py-3">
        <Prose>{value}</Prose>
      </div>
    </div>
  );
}
