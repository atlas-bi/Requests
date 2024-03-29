import type { RequestType } from '@prisma/client';
import { Link } from '@remix-run/react';
import Image from 'remix-image';
import { requestTypeLite } from '~/models/config.server';

import { Links } from './Links';
import { Notifications } from './Notifications';
import { Search } from './Search';
import { UserNav } from './UserNav';

export default function Nav({
  requestTypes,
}: {
  requestTypes: requestTypeLite[];
}) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <nav className="flex grow items-center justify-between space-x-4 lg:space-x-6 mx-6">
          <Link to="/" className="flex items-center">
            <Image
              loaderUrl="/api/image"
              src="images/logo.svg"
              responsive={[
                {
                  size: {
                    width: 35,
                    height: 35,
                  },
                  maxWidth: 35,
                },
              ]}
              dprVariants={[1, 3]}
            />
            <h2 className="scroll-m-20 text-2xl font-medium transition-colors m-0 hover:text-slate-900 text-slate-700">
              <span className="mx-2 text-slate-300">/</span>
              requests
            </h2>
          </Link>

          <div className="flex space-x-6">
            <Links />
            <Search />
          </div>
          <div className="flex space-x-6">
            <Notifications />
            <UserNav />
          </div>
        </nav>
      </div>
    </div>
  );
}
