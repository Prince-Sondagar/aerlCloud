import { Link } from '@nextui-org/react';
import { ExternalLink } from 'react-feather';

export default function Links() {
  return (
    <div className="flex-end flex gap-5 w-full justify-end mb-5">
      <Link
        href="https://status.aerl.cloud"
        target="_blank"
        isExternal
        className='text-textColor/40 hover:text-textColor transition duration-[0.25]'
      >
        System Status
        <ExternalLink className='ml-0.5 h-4 w-4' />
      </Link>
      <Link
        href="https://docs.aerl.cloud"
        target="_blank"
        isExternal
        className='text-textColor/40 hover:text-textColor/80 transition duration-[0.25]'
      >
        Help
        <ExternalLink className='ml-0.5 h-4 w-4' />
      </Link>
    </div>
  );
}
