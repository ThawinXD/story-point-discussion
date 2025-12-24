"use client";
import { AppDispatch, useAppSelector } from "../lib/store";
import { IUser } from "@/interfaces";

export default function Header() {
  const user: IUser = useAppSelector((state) => state.userSlice.user as IUser);

  console.log("Header rendered with user:", user);
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Porker Planning Tool</h1>
      </div>
    </header>
  );
}