"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SignupForm = ({
  className,
  setName,
  setEmail,
  setProfilePicture,
  setPassword,
  handleSignup,
  loading,
  error,
  setError,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={handleSignup}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-gray-600 text-sm text-balance">
            Enter your details below to create a new account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Field className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Mr. Penguin"
            required
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="penguin@example.com"
            required
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="profilePicture">Profile Picture URL</FieldLabel>
          <Input
            id="profilePicture"
            type="url"
            placeholder="https://example.com/profile.jpg"
            required
            onChange={(e) => setProfilePicture(e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </Field>

        <Field>
          {loading ? (
            <Button disabled className="flex flex-row gap-2">
              Signing up...
            </Button>
          ) : (
            <Button type="submit">Sign up</Button>
          )}
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
};

export default SignupForm;
