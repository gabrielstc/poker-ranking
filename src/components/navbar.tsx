"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trophy, Users, Calendar, User, LogOut } from "lucide-react"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Trophy className="h-6 w-6 text-primary" />
                            <span className="font-bold text-xl">Poker Ranking</span>
                        </Link>

                        <div className="flex items-center space-x-6">
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Ranking
                            </Link>

                            {session && (
                                <>
                                    <Link
                                        href="/admin/tournaments"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        <span>Torneios</span>
                                    </Link>

                                    <Link
                                        href="/admin/players"
                                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Jogadores</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>{session.user?.name || session.user?.email}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/login">
                                <Button variant="outline">Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
