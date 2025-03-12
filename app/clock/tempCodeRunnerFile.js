 {session.user.role === "MANAGER" && (
            <a href="/dashboard/manager">
              <button className="w-full py-3 px-4 my-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all flex items-center justify-center shadow-sm">
                <FiUser className="mr-2" />
                Manager Dashboard
                <FiChevronRight className="ml-auto" />
              </button>
            </a>
          )}