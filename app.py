"""Optional entry file for Streamlit Community Cloud.

Some deploy UIs validate paths against a cached tree and incorrectly report
that `streamlit_app.py` is missing. If that happens, set **Main file path**
to `app.py` instead. Locally you can still run `streamlit run streamlit_app.py`.
"""

from streamlit_app import main

main()
