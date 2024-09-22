import CommonInput from '@/components/CommonInput'
import CardLayout from '@/components/layouts/card'
import { LayoutProps } from '@/components/layouts/main'
import { Button, Input, Spacer, Spinner } from '@nextui-org/react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ChangePassword(props: LayoutProps) {
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  async function changePassword() {
    if (password !== confirmPassword) {
      setErrorText("Hmm, your passwords don't seem to match.")
      return;
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
      setErrorText(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        if (error.status == 401) {
          setErrorText("You must be logged in to change your password")
        } else {
          setErrorText(error.message)
        }
        return
      }

      setEmail(data.user.email ?? "")
    }

    load()
  }, [supabase])

  return (
    <CardLayout titleSuffix="Update Password" hideNav>
      <div className="text-textColor text-2xl font-semibold text-center mb-3.5 tracking-tighter">
        Update Password
      </div>
      <Spacer y={4} />
      <CommonInput
        type="password"
        label={<span className="text-textColor">New Password</span>}
        placeholder="••••••••"
        onChange={({ target }) => setPassword(target.value)}
        onKeyDown={(e) => { if (e.key == 'Enter') changePassword() }}
      />
      <Spacer y={4} />
      <CommonInput
        type="password"
        label={<span className="text-textColor">Confirm New Password</span>}
        placeholder="••••••••"
        onChange={({ target }) => setConfirmPassword(target.value)}
        onKeyDown={(e) => { if (e.key == 'Enter') changePassword() }}
      />
      <div className="text-error text-base py-2 text-left">
        {errorText}
      </div>
      <Button
        className="signup-btn w-full mt-8 mb-5 bg-primaryLight hover:bg-primaryLightHover transition duration-[0.25s] text-primaryLightContrast"
        onPress={() => changePassword()}
      >
        {!loading ? "Change Password" : <Spinner color="white" />}{/* size="sm" */}
      </Button>
    </CardLayout>
  )
}
