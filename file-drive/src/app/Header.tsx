import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"

const Header = () => {
  return (
    <div className="border-b py-4 bg-gray-50 " >
      <div className="flex mx-auto justify-between container items-center">
        <div> FileDrive</div>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  )
}

export default Header