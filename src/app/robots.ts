import type { MetadataRoute } from "next";

/**
 * 개인 링크(/my/<token>)와 강사 화면은 검색엔진에 색인되면 안 된다.
 * 제출 폼과 링크 재발송 페이지만 공개 대상이다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/link"],
      disallow: ["/my/", "/admin", "/submitted/"],
    },
  };
}
