"""
GitHub Profile Scraper Service
================================
Uses Crawl4AI to scrape a student's GitHub profile and repositories.
Extracts project information, tech stacks, README content, and commit patterns
to feed contextual data to AI interview agents.

The Project Deep-Dive AI Agent uses this data to ask specific questions
about the student's actual work.

Phase: Interview Mode
Status: 🔲 Not Started
Dependencies: crawl4ai

Usage:
    scraper = GitHubScraper()
    profile = await scraper.scrape_profile("username")
    # Returns: repos, tech stacks, README summaries, contribution patterns
"""

# from crawl4ai import AsyncWebCrawler
# import json
#
#
# class GitHubScraper:
#     """Scrapes GitHub profiles and repos for interview context."""
#
#     async def scrape_profile(self, github_username: str) -> dict:
#         """
#         Scrape a GitHub user's public profile and pinned repos.
#
#         Returns:
#             {
#                 "username": "...",
#                 "bio": "...",
#                 "repos": [
#                     {
#                         "name": "repo-name",
#                         "description": "...",
#                         "language": "Python",
#                         "stars": 12,
#                         "readme_summary": "...",
#                         "tech_stack": ["FastAPI", "React", "PostgreSQL"]
#                     }
#                 ],
#                 "top_languages": ["Python", "JavaScript", "TypeScript"],
#                 "contribution_pattern": "active/moderate/sparse"
#             }
#         """
#         async with AsyncWebCrawler() as crawler:
#             # Scrape profile page
#             profile_result = await crawler.arun(
#                 url=f"https://github.com/{github_username}"
#             )
#
#             # Scrape pinned/popular repos
#             repos = await self._scrape_repos(crawler, github_username)
#
#             return {
#                 "username": github_username,
#                 "profile_content": profile_result.markdown,
#                 "repos": repos
#             }
#
#     async def _scrape_repos(self, crawler, username: str) -> list:
#         """Scrape individual repo READMEs and metadata."""
#         repos = []
#         # Use GitHub API for repo list (more reliable than scraping)
#         import httpx
#         async with httpx.AsyncClient() as client:
#             response = await client.get(
#                 f"https://api.github.com/users/{username}/repos",
#                 params={"sort": "updated", "per_page": 10}
#             )
#             if response.status_code == 200:
#                 for repo_data in response.json():
#                     repo_info = {
#                         "name": repo_data["name"],
#                         "description": repo_data.get("description", ""),
#                         "language": repo_data.get("language", ""),
#                         "stars": repo_data.get("stargazers_count", 0),
#                         "url": repo_data["html_url"]
#                     }
#                     # Scrape README for detailed context
#                     readme_result = await crawler.arun(
#                         url=f"https://github.com/{username}/{repo_data['name']}"
#                     )
#                     repo_info["readme_content"] = readme_result.markdown[:3000]
#                     repos.append(repo_info)
#         return repos
#
#
#     def format_for_agent(self, profile_data: dict) -> str:
#         """Format scraped data into a context string for the AI agent."""
#         lines = [f"## GitHub Profile: {profile_data['username']}\n"]
#         for repo in profile_data.get("repos", []):
#             lines.append(f"### Project: {repo['name']}")
#             lines.append(f"Language: {repo['language']}")
#             lines.append(f"Description: {repo['description']}")
#             lines.append(f"README:\n{repo.get('readme_content', 'No README')}\n")
#         return "\n".join(lines)
