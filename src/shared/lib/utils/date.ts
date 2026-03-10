/**
 * Date 객체를 "YYYY년 M월 D일" 포맷의 문자열로 변환합니다.
 * @param dateObj 변환할 Date 객체
 * @returns 예: "2026년 3월 5일"
 */
export const formatDateKorean = (dateObj: Date) => {
  return `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`
}

/**
 * Date 객체를 "YYYY.MM.DD" 포맷의 문자열로 변환합니다. (팀원분이 말씀하신 리포트용)
 * @param dateObj 변환할 Date 객체
 * @returns 예: "2026.03.05"
 */
export const formatDateDot = (dateObj: Date) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
