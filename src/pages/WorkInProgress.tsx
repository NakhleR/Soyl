import { DisplacementSphere } from '@/components/DisplacementSphere/DisplacementSphere'
import React from 'react'

const WorkInProgress = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Displacement Sphere */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <div className="w-96 h-96">
                    <DisplacementSphere />
                </div>
            </div>
        </div>
    )
}

export default WorkInProgress