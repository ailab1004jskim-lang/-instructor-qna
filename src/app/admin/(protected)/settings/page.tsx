import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { Prose } from "@/components/Prose";
import { formatDateTime } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-lg font-bold">설정</h1>

      <div className="card p-5 md:p-6">
        <h2 className="text-sm font-bold mb-3">이메일 발송 상태</h2>
        {settings.lastEmailError ? (
          <>
            <p className="text-sm text-danger font-semibold">
              마지막 발송이 실패했습니다
              {settings.lastEmailErrorAt
                ? ` · ${formatDateTime(settings.lastEmailErrorAt)}`
                : null}
            </p>
            <div className="mt-3 rounded-lg bg-danger-bg px-4 py-3.5">
              <Prose mono>{settings.lastEmailError}</Prose>
            </div>
            <p className="mt-3 text-xs text-sub leading-relaxed">
              대부분 <strong>RESEND_API_KEY</strong> 값이 잘못됐거나, 도메인을
              인증하지 않은 상태에서 계정 소유자가 아닌 주소로 보내려 한
              경우입니다.
            </p>
          </>
        ) : settings.lastEmailOkAt ? (
          <p className="text-sm text-success">
            정상 · 마지막 발송 {formatDateTime(settings.lastEmailOkAt)}
          </p>
        ) : (
          <p className="text-sm text-sub">아직 발송 기록이 없습니다.</p>
        )}
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="text-sm font-bold mb-4">서비스</h2>
        <SettingsForm
          serviceName={settings.serviceName}
          notifyEmail={settings.notifyEmail ?? ""}
        />
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="text-sm font-bold mb-4">비밀번호</h2>
        <PasswordForm />
      </div>

      <div className="card p-5 md:p-6">
        <h2 className="text-sm font-bold mb-2">개인정보</h2>
        <p className="text-xs text-sub leading-relaxed">
          학생 이름·이메일·질문 내용을 보관합니다. 보관 기간은 학기 종료 후
          6개월이며, 이후 일괄 삭제하는 것을 권장합니다. 일괄 삭제 기능은 아직
          없으므로 DB에서 직접 처리해 주세요.
        </p>
      </div>
    </div>
  );
}
