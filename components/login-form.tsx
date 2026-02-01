"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSignIn } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isLoaded, signIn } = useSignIn()

  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function signInWithGoogle() {
    setError(null)

    if (!isLoaded || !signIn) return

    try {
      setIsSubmitting(true)
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/events",
      })
    } catch (err: unknown) {
      const anyErr = err as { errors?: Array<{ longMessage?: string; message?: string }> }
      const message =
        anyErr?.errors?.[0]?.longMessage ||
        anyErr?.errors?.[0]?.message ||
        "Unable to sign in. Please check your details and try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue with Google to access Ticketly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !isLoaded}
                onClick={signInWithGoogle}
              >
                <Image
                  src="/assets/images/google-icon.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {isSubmitting ? "Redirecting..." : "Continue with Google"}
              </Button>
              {error ? (
                <FieldDescription className="text-destructive text-center">
                  {error}
                </FieldDescription>
              ) : null}
              <FieldDescription className="text-center">
                New here?{" "}
                <Link href="/sign-up">Create your account with Google</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
