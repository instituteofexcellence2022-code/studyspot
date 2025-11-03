import React from 'react' 
import { motion } from 'framer-motion' 
 
const App: React.FC = () => { 
  return ( 
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" 
    > 
      <div className="text-center"> 
        <h1 className="text-4xl font-bold text-white mb-4">StudySpot</h1> 
        <p className="text-xl text-blue-100 mb-8">Enterprise-Grade Library Management</p> 
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20"> 
          <h2 className="text-2xl font-bold text-white mb-4">Welcome!</h2> 
          <p className="text-blue-100 mb-6">Your StudySpot PWA is ready!</p> 
          <div className="space-y-4"> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>React + Vite (Fast development)</span> 
            </div> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>PWA (Installable on mobile)</span> 
            </div> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>Lottie Animations (Professional UI)</span> 
            </div> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>React Query (Data fetching)</span> 
            </div> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>Tailwind CSS (Modern styling)</span> 
            </div> 
            <div className="flex items-center text-white"> 
              <span className="text-green-400 mr-2">✅</span> 
              <span>TypeScript (Type safety)</span> 
            </div> 
          </div> 
          <div className="mt-6 text-center"> 
            <p className="text-blue-200 text-sm">No Gradle issues! No Expo problems!</p> 
            <p className="text-blue-200 text-sm">Works in any browser on any device!</p> 
          </div> 
        </div> 
      </div> 
    </motion.div> 
  ) 
} 
 
export default App 











