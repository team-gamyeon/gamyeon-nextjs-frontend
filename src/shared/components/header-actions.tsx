import { NotificationButton } from '@/shared/components/notification-button'
import { UserProfileButton } from '@/shared/components/user-profile-button'

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1">
      <NotificationButton />
      <UserProfileButton />
    </div>
  )
}
