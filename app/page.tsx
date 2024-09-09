  "use client";
  import { invoke } from '@tauri-apps/api/core';
  import { useState } from "react";

  export default function Home() {
    const [audioDevices, setAudioDevices] = useState<string[]>([]);

    const handleShowAudioDevices = async () => {
      try {
        const devices = await invoke('show_devices') as string[];
        const parsedDevices = devices
          .filter(line => line.includes('[AVFoundation indev @') && line.includes(']'))
          .map(line => {
            const match = line.match(/\[(\d+)\] (.+)/);
            return match ? match[2] : null;
          })
          .filter((device): device is string => device !== null);
        
        setAudioDevices(parsedDevices);
      } catch (error) {
        console.error('获取音频设备失败:', error);
        setAudioDevices(['无法获取音频设备信息']);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <main className="flex flex-col gap-8 items-center">
          <h1 className="text-2xl font-bold">音频设备列表</h1>
          <button
            onClick={handleShowAudioDevices}
            className="rounded-full bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition-colors"
          >
            显示当前音频设备
          </button>
          {audioDevices.length > 0 && (
            <ul className="list-disc pl-5">
              {audioDevices.map((device, index) => (
                <li key={index}>{device}</li>
              ))}
            </ul>
          )}
        </main>
      </div>
    );
  }
