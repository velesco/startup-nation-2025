import React from 'react';
import '../../styles/spots.css';

const AvailableSpotsSection = () => {
  // Data for each card
  const cardsData = [
    {
      id: 1,
      title: "2.a.3 Persoane cu vârsta între 18 ani și până în 30 de ani neîmpliniți la momentul înscrierii: Grup țintă cu domiciliul în București-Ilfov",
      totalSpots: 2850,
      availableSpots: 1470
    },
    {
      id: 2,
      title: "2.a.3 Persoane cu vârsta între 18 ani și până în 30 de ani neîmpliniți la momentul înscrierii: Grup țintă minorități Roma cu domiciliul în București-Ilfov",
      totalSpots: 317,
      availableSpots: 284
    },
    {
      id: 3,
      title: "2.a.3 Persoane cu vârsta între 18 ani și până în 30 de ani neîmpliniți la momentul înscrierii: Grup țintă cu domiciliul în regiunile mai puțin dezvoltate fără București-Ilfov",
      totalSpots: 25538,
      availableSpots: 15376
    },
    {
      id: 4,
      title: "2.a.3 Persoane cu vârsta între 18 ani și până în 30 de ani neîmpliniți la momentul înscrierii: Grup țintă minorități Roma cu domiciliul în regiunile mai puțin dezvoltate fără București-Ilfov",
      totalSpots: 2838,
      availableSpots: 2667
    },
    {
      id: 5,
      title: "4.a.2 Persoane cu vârsta mai mare de 30 de ani, inclusiv: Grup țintă cu domiciliul în regiunile mai puțin dezvoltate fără București-Ilfov",
      totalSpots: 5750,
      availableSpots: 0
    }
  ];

  return (
    <section className="spots" id="spots">
      <h2 className="section-title">Locuri disponibile</h2>
      
      <div className="spots-grid">
        {cardsData.map((card) => (
          <div key={card.id} className="spot-card">
            <p className="spot-text">{card.title}</p>
            <div className="spot-details">
              <div className="spot-total">
                <p className="spot-label">Total locuri</p>
                <p className="spot-number spot-number-total">{card.totalSpots}</p>
              </div>
              <div className="spot-available">
                <p className="spot-label">Locuri disponibile</p>
                <p className={`spot-number ${card.availableSpots > 0 ? 'spot-number-available' : 'spot-number-unavailable'}`}>
                  {card.availableSpots}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AvailableSpotsSection;