import { ImageService } from '../../services/imageService';
import {
  Cloud, Database, HardDrive, Server, Globe, CheckCircle, AlertCircle, Info
} from 'lucide-react';

export function StorageStatus() {
  const storageInfo = ImageService.getCurrentStorageProviderInfo();

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'digitalocean_spaces': return <Cloud className="w-5 h-5" />;
      case 'cloudflare_r2': return <Globe className="w-5 h-5" />;
      case 'aws_s3': return <Database className="w-5 h-5" />;
      case 'azure_blob': return <Server className="w-5 h-5" />;
      case 'github': return <HardDrive className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStatusColor = (configured: boolean) => {
    return configured ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusIcon = (configured: boolean) => {
    return configured ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getProviderIcon(storageInfo.provider)}
          <h3 className="text-lg font-semibold text-white">Storage Provider</h3>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(storageInfo.configured)}`}>
          {getStatusIcon(storageInfo.configured)}
          <span className="text-sm font-medium">
            {storageInfo.configured ? 'Configured' : 'Not Configured'}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Provider:</span>
          <span className="text-white font-medium">{storageInfo.name}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Plan:</span>
          <span className={`font-medium ${storageInfo.isFree ? 'text-green-400' : 'text-blue-400'}`}>
            {storageInfo.isFree ? 'Free' : 'Paid'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Storage Limit:</span>
          <span className="text-white font-medium">{storageInfo.storageLimit}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Cost:</span>
          <span className="text-white font-medium">{storageInfo.cost}</span>
        </div>

        {/* Debug information for DigitalOcean Spaces */}
        {storageInfo.provider === 'digitalocean_spaces' && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Info:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Endpoint:</span>
                <span className="text-gray-300 font-mono">
                  {storageInfo.configured ? '✓ Configured' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Access Key:</span>
                <span className="text-gray-300 font-mono">
                  {storageInfo.configured ? '✓ Configured' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Environment:</span>
                <span className="text-gray-300 font-mono">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {!storageInfo.configured && storageInfo.provider !== 'github' && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded">
          <p className="text-xs text-yellow-300">
            This storage provider is not configured. Images will fall back to GitHub Releases.
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Configure storage providers in your <code className="bg-gray-700 px-1 rounded">.env</code> file
        </p>
      </div>
    </div>
  );
}

export default StorageStatus;
