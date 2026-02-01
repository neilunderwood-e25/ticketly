"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSignUp } from "@clerk/nextjs"

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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { isLoaded, signUp } = useSignUp()
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function signUpWithGoogle() {
    setError(null)
    if (!isLoaded || !signUp) return

    try {
      setIsSubmitting(true)
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/events",
      })
    } catch (err: unknown) {
      const anyErr = err as { errors?: Array<{ longMessage?: string; message?: string }> }
      const message =
        anyErr?.errors?.[0]?.longMessage ||
        anyErr?.errors?.[0]?.message ||
        "Unable to sign up. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Continue with Google to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || !isLoaded}
              onClick={signUpWithGoogle}
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

            <FieldDescription className="px-6 text-center">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
