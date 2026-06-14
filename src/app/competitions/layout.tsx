import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compete",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
