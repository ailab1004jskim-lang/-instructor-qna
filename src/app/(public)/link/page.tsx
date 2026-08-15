import { LinkRequestForm } from "@/components/LinkRequestForm";

export default function LinkPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6 md:p-8">
        <h1 className="text-lg font-bold">내 질문 확인 링크 받기</h1>
        <p className="mt-1.5 text-sm text-sub leading-relaxed">
          질문할 때 입력한 이메일 주소로 확인 링크를 다시 보내드립니다.
        </p>
        <div className="mt-6">
          <LinkRequestForm />
        </div>
      </div>
    </div>
  );
}
