export default function About() {
  return (
    <div className="page-layout">
      <div className="page-content">
        <div className="page-section">
          <div className="glass-enhanced rounded-2xl p-8 content-spacing-lg">
            <div className="visual-hierarchy">
              <h1 className="page-title text-white mb-8 drop-shadow-2xl">
                About TruFlo
              </h1>
              <div className="space-y-6 text-white/90">
                <p className="text-lg leading-relaxed">
                  We are trying to be the first productivity app that understands your mood to help you break free from distractions and unproductive habits.
                </p>
                
                <div className="content-grid content-grid-2 mt-12">
                  <div className="glass-card p-6 rounded-xl">
                    <h2 className="section-heading text-white mb-4">Our Mission</h2>
                    <p className="text-white/80">
                      To revolutionize productivity by understanding and adapting to your emotional state, 
                      creating a personalized experience that works with your natural rhythms.
                    </p>
                  </div>
                  
                  <div className="glass-card p-6 rounded-xl">
                    <h2 className="section-heading text-white mb-4">Our Vision</h2>
                    <p className="text-white/80">
                      A world where productivity tools enhance rather than fight against human nature, 
                      making meaningful progress feel natural and sustainable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-section">
          <div className="glass-enhanced rounded-2xl p-8">
            <div className="visual-hierarchy mb-8">
              <h2 className="section-heading text-white drop-shadow-lg">
                Meet the Team
              </h2>
            </div>
            <div className="content-grid content-grid-4">
              {[
                { name: 'Sourish Kumar', role: 'Founder & CEO', emoji: '👨‍💼' },
                { name: 'Freddie Letzer', role: 'Co-Founder & CFO', emoji: '💼' },
                { name: 'Leo Nguyen', role: 'Web Developer', emoji: '💻' },
                { name: 'David Nguyen', role: 'UI/UX Developer', emoji: '🎨' }
              ].map((member, index) => (
                <div key={index} className="glass-card p-6 rounded-xl text-center hover">
                  <div className="text-4xl mb-4">{member.emoji}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-white/70 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}