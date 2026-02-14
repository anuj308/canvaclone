'use client' 
import Image from "next/image"
import LoginCard from "@/components/ui/login/login-card"

const Login = () => {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-cover bg-center"
      style={{backgroundImage:"url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80')"}}> 
        <div className="absolute inset-0"
        style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8))'}}>
          <div className="absolute top-4 left-4 z-10">
            <Image
              src="/full-logo.svg"
              alt="Aakaar"
              width={170}
              height={40}
              priority
            />
                        
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <LoginCard/>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Login
