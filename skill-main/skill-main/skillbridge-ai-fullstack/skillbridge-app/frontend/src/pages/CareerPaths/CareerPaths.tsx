import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';

const domains = [
  { name: 'Web Development', icon: '🌐', available: true, blurb: 'HTML, CSS, JavaScript, React and practical build skills.' },
  { name: 'Data Science', icon: '📊', available: false, blurb: 'Statistics, Python and model building.' },
  { name: 'Artificial Intelligence', icon: '🤖', available: false, blurb: 'Machine learning fundamentals through applied systems.' },
  { name: 'UI/UX Design', icon: '🎨', available: false, blurb: 'Research, wireframing and interface design.' },
  { name: 'Cybersecurity', icon: '🔐', available: false, blurb: 'Threat modeling and secure system design.' },
  { name: 'Cloud Computing', icon: '☁️', available: false, blurb: 'Infrastructure and cloud-native architecture.' },
];

export default function CareerPaths() {
  const navigate = useNavigate();
  return (
    <div>
      <p className="text-sb-textSoft mb-8 max-w-xl">
        Choose the path you want to build competency in. Web Development is fully live — everything
        else is on the roadmap.
      </p>
      <div className="grid md:grid-cols-3 gap-5">
        {domains.map((d) => (
          <Card
            key={d.name}
            className={`transition-transform ${d.available ? 'cursor-pointer hover:-translate-y-1 hover:shadow-hover' : 'opacity-60'}`}
          >
            <div onClick={() => d.available && navigate('/assessment')}>
              <div className="text-2xl mb-3">{d.icon}</div>
              <h3 className="font-semibold mb-1">{d.name}</h3>
              <p className="text-sm text-sb-textSoft mb-4">{d.blurb}</p>
              <span className={`text-xs font-semibold ${d.available ? 'text-[#4E9FC9]' : 'text-sb-textSoft'}`}>
                {d.available ? '● Available now' : '🔒 Coming soon'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
