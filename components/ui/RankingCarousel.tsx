
import React, { useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel';
import { Crown, Medal, Star, Trophy } from 'lucide-react';

interface RankingItem {
  id: string;
  rank: number;
  points: number;
  // For students
  name?: string;
  student_id?: string;
  // For both students and departments
  department?: string;
}

interface RankingCarouselProps {
  items: RankingItem[];
  type: 'student' | 'department';
  currentUserId?: string;
}

const RankingCarousel = ({ items, type, currentUserId }: RankingCarouselProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Star className="h-5 w-5 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-blue-500" />;
  };

  const getRankGradient = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  // Auto-scroll functionality
  const scrollToNext = useCallback(() => {
    if (!api) return;
    api.scrollNext();
  }, [api]);

  useEffect(() => {
    if (!api) return;

    // Set up auto-scroll every 3 seconds
    const autoScroll = setInterval(() => {
      scrollToNext();
    }, 3000);

    // Update current slide
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Pause auto-scroll on user interaction
    const handlePointerDown = () => {
      clearInterval(autoScroll);
    };

    const handlePointerUp = () => {
      // Resume auto-scroll after 5 seconds of inactivity
      setTimeout(() => {
        const newAutoScroll = setInterval(scrollToNext, 3000);
        return () => clearInterval(newAutoScroll);
      }, 5000);
    };

    const emblaContainer = api.containerNode();
    emblaContainer.addEventListener('pointerdown', handlePointerDown);
    emblaContainer.addEventListener('pointerup', handlePointerUp);

    return () => {
      clearInterval(autoScroll);
      emblaContainer.removeEventListener('pointerdown', handlePointerDown);
      emblaContainer.removeEventListener('pointerup', handlePointerUp);
    };
  }, [api, scrollToNext]);

  // If only one item, don't show carousel
  if (items.length <= 1) {
    const item = items[0];
    if (!item) return null;

    return (
      <div className="h-full">
        <div 
          className={`p-4 rounded-xl bg-gradient-to-r ${getRankGradient(item.rank)} text-white transform hover:scale-105 transition-all duration-300 shadow-lg h-full flex flex-col justify-center ${
            type === 'student' && item.student_id === currentUserId ? 'ring-4 ring-blue-300/50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRankIcon(item.rank)}
              <div>
                <p className="font-bold text-lg">
                  {type === 'student' ? item.name : item.department}
                </p>
                {type === 'student' && (
                  <>
                    <p className="text-sm opacity-90">{item.department}</p>
                    <p className="text-xs opacity-75">ID: {item.student_id}</p>
                  </>
                )}
                {type === 'department' && (
                  <p className="text-sm opacity-90">Rank #{item.rank}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{item.points}</p>
              <p className="text-sm opacity-90">points</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Carousel
        setApi={setApi}
        className="flex-1"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="h-full">
          {items.map((item) => (
            <CarouselItem key={item.id} className="h-full">
              <div 
                className={`p-4 rounded-xl bg-gradient-to-r ${getRankGradient(item.rank)} text-white transform hover:scale-105 transition-all duration-300 shadow-lg h-full flex flex-col justify-center ${
                  type === 'student' && item.student_id === currentUserId ? 'ring-4 ring-blue-300/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(item.rank)}
                    <div>
                      <p className="font-bold text-lg">
                        {type === 'student' ? item.name : item.department}
                      </p>
                      {type === 'student' && (
                        <>
                          <p className="text-sm opacity-90">{item.department}</p>
                          <p className="text-xs opacity-75">ID: {item.student_id}</p>
                        </>
                      )}
                      {type === 'department' && (
                        <p className="text-sm opacity-90">Rank #{item.rank}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.points}</p>
                    <p className="text-sm opacity-90">points</p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === current ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingCarousel;
