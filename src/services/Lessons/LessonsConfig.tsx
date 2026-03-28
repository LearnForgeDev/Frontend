import React from 'react';
import './styles.css';

export const LessonsConfig: React.FC = () => {
    return (
        <div>
            <h3>Lessons Configuration</h3>
            <p>Customize the Lesson Editor and Viewer.</p>
            {/* Here we would use react-hook-form or similar */}
            <form className="lessons-config-form">
                <label>
                    <input type="checkbox" defaultChecked />
                    Allow Public Sharing
                </label>
                <label>
                    Max Video Quality
                    <select defaultValue="1080p">
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                    </select>
                </label>
            </form>
        </div>
    );
};
