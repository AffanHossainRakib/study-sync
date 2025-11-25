import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav>
      <ul className="flex justify-center items-center py-5">
        <li className="mr-5">
          <Link href="/">Home</Link>
        </li>
        <li className="mr-5">
          <Link href="/AllStudyPlans">AllStudyPlans</Link>
        </li>
        <li className="mr-5">
          <Link href="/StudyPlan">My Study Plan</Link>
        </li>
        <li className="mr-5">
          <Link href="/login">Login</Link>
        </li>
        <li className="mr-5">
          <Link href="/register">Register</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
