import { test, expect } from '@playwright/test'

test.describe('결과 리포트 - 삭제 버튼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/result')
    await page.waitForLoadState('networkidle')
  })

  test('삭제 버튼 클릭 시 확인 모달이 뜬다', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: '삭제' }).first()
    await expect(deleteBtn).toBeVisible()

    await deleteBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('면접 기록 삭제')).toBeVisible()
    await expect(dialog.getByText('이 면접 기록을 삭제하면 복구할 수 없습니다')).toBeVisible()

  })

  test('모달에서 취소 클릭 시 닫힌다', async ({ page }) => {
    await page.getByRole('button', { name: '삭제' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: '취소' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('모달 열릴 때 페이지 layout shift 없는지 확인', async ({ page }) => {
    // 페이지 제목(h1)을 기준 요소로 사용 - 모달과 무관한 안정적인 요소
    const title = page.getByRole('heading', { name: '면접 결과 리포트' })
    const titleBefore = await title.boundingBox()

    await page.getByRole('button', { name: '삭제' }).first().click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const titleAfter = await title.boundingBox()

    console.log('제목 위치 (전):', titleBefore)
    console.log('제목 위치 (후):', titleAfter)

    // x 좌표가 1px 이상 변하면 layout shift
    const xDiff = Math.abs((titleBefore?.x ?? 0) - (titleAfter?.x ?? 0))
    console.log('X축 이동량(px):', xDiff)

    expect(xDiff).toBeLessThan(1)
  })
})
