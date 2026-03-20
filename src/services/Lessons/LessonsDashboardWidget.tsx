import React from 'react';
import '../../styles/services/Lessons/styles.css';

export const LessonsDashboardWidget: React.FC = () => {
    return (
        <div className="lessons-widget-inner">
            <h4>Lessons Stats</h4>
            <p><strong>12</strong> New Lessons this week</p>
            <p><strong>540</strong> Total Views</p>
        </div>
    );
};
