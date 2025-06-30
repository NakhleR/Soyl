import { useRive } from '@rive-app/react-canvas';

const WorkInProgress = () => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/catnotfound_remix.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Animation */}
      <div className="flex items-center justify-center">
        <RiveComponent style={{ width: '80vw', height: '60vh' }} />
      </div>

      {/* Text Content */}
      <div className="space-y-4 max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-600 mb-4">
          Our website is still traveling through the portal...
        </h1>

        <div className="space-y-3 text-base md:text-lg text-slate-500 leading-relaxed">
          <p className="font-medium">
            Looks like our code cats got curious and wandered off mid-build.
          </p>
          <p>
            Don't worry — they'll be back soon with something awesome.
          </p>
          <p className="text-blue-500">
            In the meantime, sit tight, grab a snack, and enjoy the interdimensional cat chaos. 🐾
          </p>
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center items-center space-x-2 mt-6">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgress;